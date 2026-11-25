"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import type L from "leaflet";
import {
  advanceBookingStatusApi,
  getBookingTrackingApi,
  updateBookingLocationApi,
  type BookingTrackingSnapshot,
} from "@/lib/api/bookings";
import { emitWithAck, getSocket } from "@/lib/realtime/socket";

interface BookingLiveTrackerProps {
  bookingId: string;
  role: "customer" | "artisan";
  onStatusChanged?: () => void;
}

type GoogleMapsApi = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => {
      setCenter: (pos: { lat: number; lng: number }) => void;
      setZoom: (z: number) => void;
      setMapTypeId: (id: string) => void;
      fitBounds: (bounds: unknown, padding?: number) => void;
      addListener: (event: string, cb: (e: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
    };
    Marker: new (opts: Record<string, unknown>) => {
      setPosition: (pos: { lat: number; lng: number }) => void;
      setIcon: (icon: unknown) => void;
      setMap: (map: unknown) => void;
    };
    Polyline: new (opts: Record<string, unknown>) => {
      setPath: (path: Array<{ lat: number; lng: number }>) => void;
      setOptions: (opts: Record<string, unknown>) => void;
      setMap: (map: unknown) => void;
    };
    LatLngBounds: new () => {
      extend: (pos: { lat: number; lng: number }) => void;
    };
    SymbolPath: {
      FORWARD_CLOSED_ARROW: unknown;
      CIRCLE: unknown;
    };
  };
};

let googleMapsPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  const existing = (window as unknown as { google?: GoogleMapsApi }).google;
  if (existing?.maps?.Map) return Promise.resolve(existing);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const loaded = (window as unknown as { google?: GoogleMapsApi }).google;
      if (loaded?.maps?.Map) resolve(loaded);
      else reject(new Error("Google Maps failed to initialize"));
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

export default function BookingLiveTracker({
  bookingId,
  role,
  onStatusChanged,
}: BookingLiveTrackerProps) {
  const [snapshot, setSnapshot] = useState<BookingTrackingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharingGps, setSharingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [coarseHint, setCoarseHint] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [usingGoogleMaps, setUsingGoogleMaps] = useState<boolean>(Boolean(GOOGLE_MAPS_KEY));

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const autoStartedRef = useRef(false);
  const lastSentAtRef = useRef<number>(0);

  // Google Maps refs
  const gMapRef = useRef<InstanceType<GoogleMapsApi["maps"]["Map"]> | null>(null);
  const gArtisanMarkerRef = useRef<InstanceType<GoogleMapsApi["maps"]["Marker"]> | null>(null);
  const gDestMarkerRef = useRef<InstanceType<GoogleMapsApi["maps"]["Marker"]> | null>(null);
  const gRouteLineRef = useRef<InstanceType<GoogleMapsApi["maps"]["Polyline"]> | null>(null);

  // Leaflet fallback refs
  const lMapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const lArtisanMarkerRef = useRef<L.Marker | null>(null);
  const lDestMarkerRef = useRef<L.Marker | null>(null);
  const lRouteLineRef = useRef<L.Polyline | null>(null);

  const loadSnapshot = useCallback(async () => {
    try {
      const data = await getBookingTrackingApi(bookingId);
      setSnapshot(data);
    } catch {
      // Ignore transient load errors
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    let active = true;
    getBookingTrackingApi(bookingId)
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
        if (
          data.trackingActive &&
          !autoStartedRef.current &&
          (role === "customer" || (role === "artisan" && data.status === "ON_THE_WAY"))
        ) {
          autoStartedRef.current = true;
          setSharingGps(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId, role]);

  // Socket.IO subscription using shared socket client
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const joinRoom = () => {
      void emitWithAck<BookingTrackingSnapshot>(socket, "booking.tracking.join", { bookingId })
        .then((data) => {
          if (data?.bookingId === bookingId) setSnapshot(data);
        })
        .catch(() => {});
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const onLocationUpdated = (data: BookingTrackingSnapshot) => {
      if (data?.bookingId === bookingId) setSnapshot(data);
    };

    const onTrackingEnded = (payload: { bookingId?: string }) => {
      if (payload?.bookingId === bookingId) {
        setSharingGps(false);
        void loadSnapshot();
        onStatusChanged?.();
      }
    };

    socket.on("booking.location.updated", onLocationUpdated);
    socket.on("booking.tracking.ended", onTrackingEnded);

    return () => {
      socket.emit("booking.tracking.leave", { bookingId });
      socket.off("connect", joinRoom);
      socket.off("booking.location.updated", onLocationUpdated);
      socket.off("booking.tracking.ended", onTrackingEnded);
    };
  }, [bookingId, loadSnapshot, onStatusChanged]);

  const sendLocationPayload = useCallback(
    async (payload: {
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      source?: "GPS" | "MAP_PIN";
      heading?: number;
      speedMps?: number;
      capturedAt: string;
    }) => {
      setCoarseHint(null);
      const socket = getSocket();
      if (socket?.connected) {
        try {
          const updated = await emitWithAck<BookingTrackingSnapshot>(
            socket,
            "booking.location.update",
            { bookingId, ...payload }
          );
          if (updated?.bookingId === bookingId) setSnapshot(updated);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to send location.");
        }
      } else {
        try {
          const updated = await updateBookingLocationApi(bookingId, payload);
          setSnapshot(updated);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to update location.");
        }
      }
    },
    [bookingId]
  );

  // Device GPS watchPosition stream
  useEffect(() => {
    if (!sharingGps) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const sendCoords = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = pos.coords;
      setGpsAccuracy(Math.round(accuracy));
      if (accuracy > 150) {
        setCoarseHint(
          `Browser location is approximate (±${Math.round(accuracy)}m). Click your exact spot on the map to set your pin.`
        );
        // Center map on the user's approximate area so they aren't stuck looking at a default address
        if (gMapRef.current) {
          gMapRef.current.setCenter({ lat: latitude, lng: longitude });
          gMapRef.current.setZoom(14);
        } else if (lMapRef.current) {
          lMapRef.current.setView([latitude, longitude], 14);
        }
        setSharingGps(false);
        return;
      }

      const now = Date.now();
      if (now - lastSentAtRef.current < 4500) return;
      lastSentAtRef.current = now;
      const capturedMs =
        pos.timestamp && Math.abs(now - pos.timestamp) < 60_000 ? pos.timestamp : now;

      await sendLocationPayload({
        latitude,
        longitude,
        accuracyMeters: Math.round(accuracy),
        source: "GPS",
        ...(typeof heading === "number" && Number.isFinite(heading) && heading >= 0
          ? { heading }
          : {}),
        ...(typeof speed === "number" && Number.isFinite(speed) && speed >= 0 ? { speedMps: speed } : {}),
        capturedAt: new Date(capturedMs).toISOString(),
      });
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        void sendCoords(pos);
      },
      (err) => {
        setCoarseHint(err.message || "Enable location access or click on the map to set your pin.");
        setSharingGps(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [bookingId, sendLocationPayload, sharingGps]);

  // Toggle Google Maps satellite / roadmap view
  useEffect(() => {
    if (gMapRef.current) {
      gMapRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Render Google Maps (primary) or Leaflet (fallback)
  useEffect(() => {
    let cancelled = false;
    if (!mapContainerRef.current || !snapshot?.destination) return;
    const dest = snapshot.destination;

    const renderGoogle = async () => {
      const google = await loadGoogleMaps(GOOGLE_MAPS_KEY);
      if (cancelled || !mapContainerRef.current) return;

      if (!gMapRef.current) {
        gMapRef.current = new google.maps.Map(mapContainerRef.current, {
          center: { lat: dest.latitude, lng: dest.longitude },
          zoom: 15,
          mapTypeId: mapType,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        gMapRef.current.addListener("click", (e) => {
          if (!e.latLng) return;
          void sendLocationPayload({
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
            accuracyMeters: 5,
            source: "MAP_PIN",
            capturedAt: new Date().toISOString(),
          }).then(() => {
            toast.success(
              role === "customer" ? "Customer pin updated on map." : "Artisan pin updated on map."
            );
          });
        });
      }

      const map = gMapRef.current;
      const destPos = { lat: dest.latitude, lng: dest.longitude };
      const destIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#001B40",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 3,
      };

      if (!gDestMarkerRef.current) {
        gDestMarkerRef.current = new google.maps.Marker({
          position: destPos,
          map,
          icon: destIcon,
          title: "Customer Destination",
          label: { text: "C", color: "#FFFFFF", fontWeight: "700", fontSize: "11px" },
        });
      } else {
        gDestMarkerRef.current.setPosition(destPos);
      }

      if (snapshot.artisan) {
        const art = snapshot.artisan;
        const artPos = { lat: art.latitude, lng: art.longitude };
        // Bolt/Uber-style rotating directional arrow pointer
        const artIcon = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          rotation: art.heading ?? 0,
          fillColor: "#059669",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };

        if (!gArtisanMarkerRef.current) {
          gArtisanMarkerRef.current = new google.maps.Marker({
            position: artPos,
            map,
            icon: artIcon,
            title: "Artisan Live Location",
          });
        } else {
          gArtisanMarkerRef.current.setPosition(artPos);
          gArtisanMarkerRef.current.setIcon(artIcon);
        }

        const decoded = snapshot.encodedPolyline ? decodePolyline(snapshot.encodedPolyline) : [];
        const path =
          decoded.length > 1
            ? decoded.map(([lat, lng]) => ({ lat, lng }))
            : [artPos, destPos];

        if (!gRouteLineRef.current) {
          gRouteLineRef.current = new google.maps.Polyline({
            path,
            map,
            strokeColor: "#001B40",
            strokeOpacity: decoded.length > 1 ? 0.9 : 0.65,
            strokeWeight: decoded.length > 1 ? 5 : 3,
          });
        } else {
          gRouteLineRef.current.setPath(path);
          gRouteLineRef.current.setOptions({
            strokeOpacity: decoded.length > 1 ? 0.9 : 0.65,
            strokeWeight: decoded.length > 1 ? 5 : 3,
          });
        }

        const bounds = new google.maps.LatLngBounds();
        for (const p of path) bounds.extend(p);
        map.fitBounds(bounds, 50);
      } else {
        map.setCenter(destPos);
      }
    };

    const renderLeaflet = async () => {
      if (!leafletRef.current) {
        const mod = await import("leaflet");
        if (cancelled) return;
        leafletRef.current = mod.default ?? mod;
      }
      const leaflet = leafletRef.current;
      if (!mapContainerRef.current) return;

      if (!lMapRef.current) {
        lMapRef.current = leaflet.map(mapContainerRef.current, {
          center: [dest.latitude, dest.longitude],
          zoom: 15,
          zoomControl: true,
        });
        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          })
          .addTo(lMapRef.current);
        lMapRef.current.on("click", (e: L.LeafletMouseEvent) => {
          void sendLocationPayload({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            accuracyMeters: 5,
            source: "MAP_PIN",
            capturedAt: new Date().toISOString(),
          }).then(() => {
            toast.success(
              role === "customer" ? "Customer pin updated on map." : "Artisan pin updated on map."
            );
          });
        });
      }

      const map = lMapRef.current;
      const destIcon = leaflet.divIcon({
        className: "",
        html: `<div style="background:#001B40;color:#fff;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">Customer</div>`,
        iconSize: [78, 24],
        iconAnchor: [39, 12],
      });

      if (!lDestMarkerRef.current) {
        lDestMarkerRef.current = leaflet
          .marker([dest.latitude, dest.longitude], { icon: destIcon })
          .addTo(map);
      } else {
        lDestMarkerRef.current.setLatLng([dest.latitude, dest.longitude]);
      }

      if (snapshot.artisan) {
        const art = snapshot.artisan;
        const artIcon = leaflet.divIcon({
          className: "",
          html: `<div style="background:#059669;color:#fff;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">Artisan</div>`,
          iconSize: [68, 24],
          iconAnchor: [34, 12],
        });
        if (!lArtisanMarkerRef.current) {
          lArtisanMarkerRef.current = leaflet
            .marker([art.latitude, art.longitude], { icon: artIcon })
            .addTo(map);
        } else {
          lArtisanMarkerRef.current.setLatLng([art.latitude, art.longitude]);
        }

        const decoded = snapshot.encodedPolyline ? decodePolyline(snapshot.encodedPolyline) : [];
        const latLngs: L.LatLngExpression[] =
          decoded.length > 1
            ? decoded
            : [
                [art.latitude, art.longitude],
                [dest.latitude, dest.longitude],
              ];
        if (!lRouteLineRef.current) {
          lRouteLineRef.current = leaflet
            .polyline(latLngs, {
              color: "#001B40",
              weight: decoded.length > 1 ? 4 : 3,
              dashArray: decoded.length > 1 ? undefined : "6 6",
            })
            .addTo(map);
        } else {
          lRouteLineRef.current.setLatLngs(latLngs);
        }
        map.fitBounds(leaflet.latLngBounds(latLngs), { padding: [45, 45], maxZoom: 16 });
      } else {
        map.setView([dest.latitude, dest.longitude], 15);
      }
    };

    if (GOOGLE_MAPS_KEY && usingGoogleMaps) {
      renderGoogle().catch(() => {
        if (!cancelled) {
          setUsingGoogleMaps(false);
          void renderLeaflet();
        }
      });
    } else {
      void renderLeaflet();
    }

    return () => {
      cancelled = true;
    };
  }, [mapType, role, sendLocationPayload, snapshot, usingGoogleMaps]);

  useEffect(() => {
    return () => {
      lMapRef.current?.remove();
      lMapRef.current = null;
      lArtisanMarkerRef.current = null;
      lDestMarkerRef.current = null;
      lRouteLineRef.current = null;
      gArtisanMarkerRef.current?.setMap(null);
      gDestMarkerRef.current?.setMap(null);
      gRouteLineRef.current?.setMap(null);
      gMapRef.current = null;
    };
  }, []);

  const handleAdvanceStatus = async (nextStatus: "ON_THE_WAY" | "ARRIVED") => {
    setUpdatingStatus(true);
    try {
      await advanceBookingStatusApi(bookingId, nextStatus);
      toast.success(nextStatus === "ON_THE_WAY" ? "Marked as on the way." : "Marked as arrived.");
      if (nextStatus === "ON_THE_WAY") setSharingGps(true);
      if (nextStatus === "ARRIVED") setSharingGps(false);
      await loadSnapshot();
      onStatusChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update booking status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || !snapshot || !snapshot.trackingActive) return null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Live Location Tracker
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {snapshot.destination?.source === "LIVE_GPS" ? "Customer Live GPS" : "Saved Address"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {snapshot.destination?.address || "Customer destination ready"}
            {snapshot.destination?.instructions ? ` · ${snapshot.destination.instructions}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {snapshot.distanceKm !== null && (
            <span className="px-3 py-1 rounded-xl bg-neutral-100 text-xs font-semibold text-neutral-800">
              {snapshot.distanceKm} km away · ~{snapshot.etaMinutes ?? 1} min
              {snapshot.etaSource === "GOOGLE_ROUTES" ? " (live traffic)" : ""}
            </span>
          )}
          {usingGoogleMaps && (
            <button
              type="button"
              onClick={() => setMapType((m) => (m === "roadmap" ? "hybrid" : "roadmap"))}
              className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 cursor-pointer"
            >
              {mapType === "roadmap" ? "Satellite View" : "Map View"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSharingGps((v) => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              sharingGps
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#001B40] text-white hover:bg-[#052F5F]"
            }`}
          >
            {sharingGps
              ? `Sharing GPS${gpsAccuracy !== null ? ` (±${gpsAccuracy}m)` : ""}`
              : role === "customer"
              ? "Share My Exact GPS"
              : "Start Live GPS"}
          </button>
          {role === "artisan" && snapshot.navigationUrl && (
            <a
              href={snapshot.navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
            >
              Start Navigation ↗
            </a>
          )}
        </div>
      </div>

      {coarseHint && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs text-amber-900">
          {coarseHint}
        </div>
      )}

      {role === "artisan" && (
        <div className="flex items-center gap-2 flex-wrap">
          {snapshot.status === "ACCEPTED" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => void handleAdvanceStatus("ON_THE_WAY")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              I&apos;m On The Way
            </button>
          )}
          {snapshot.status === "ON_THE_WAY" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => void handleAdvanceStatus("ARRIVED")}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Mark as Arrived
            </button>
          )}
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-72 sm:h-80 rounded-2xl border border-neutral-200 overflow-hidden z-0"
      />
    </div>
  );
}

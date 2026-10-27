import { GeocodedLocation } from "@/types/customer";

/**
 * Curated Nigerian metropolitan areas and popular locations with precise coordinates
 */
export const POPULAR_NIGERIAN_LOCATIONS: GeocodedLocation[] = [
  {
    id: "loc-lag-1",
    name: "Lekki Phase 1",
    address: "Admiralty Way, Lekki Phase 1, Lagos",
    area: "Lekki Phase 1",
    city: "Eti-Osa",
    state: "Lagos",
    latitude: 6.4474,
    longitude: 3.4731,
  },
  {
    id: "loc-lag-2",
    name: "Victoria Island",
    address: "Ahmadu Bello Way, Victoria Island, Lagos",
    area: "Victoria Island",
    city: "Lagos Island",
    state: "Lagos",
    latitude: 6.4281,
    longitude: 3.4219,
  },
  {
    id: "loc-lag-3",
    name: "Ikeja GRA",
    address: "Isaac John Street, Ikeja GRA, Ikeja, Lagos",
    area: "Ikeja GRA",
    city: "Ikeja",
    state: "Lagos",
    latitude: 6.5912,
    longitude: 3.3551,
  },
  {
    id: "loc-lag-4",
    name: "Yaba",
    address: "Herbert Macaulay Way, Yaba, Lagos",
    area: "Yaba",
    city: "Lagos Mainland",
    state: "Lagos",
    latitude: 6.5095,
    longitude: 3.3711,
  },
  {
    id: "loc-lag-5",
    name: "Surulere",
    address: "Adeniran Ogunsanya Street, Surulere, Lagos",
    area: "Surulere",
    city: "Surulere",
    state: "Lagos",
    latitude: 6.4969,
    longitude: 3.3541,
  },
  {
    id: "loc-lag-6",
    name: "Ikoyi",
    address: "Awolowo Road, Ikoyi, Lagos",
    area: "Ikoyi",
    city: "Eti-Osa",
    state: "Lagos",
    latitude: 6.4549,
    longitude: 3.4347,
  },
  {
    id: "loc-lag-7",
    name: "Magodo Phase 2",
    address: "Cmd Road, Magodo Phase 2, Kosofe, Lagos",
    area: "Magodo",
    city: "Kosofe",
    state: "Lagos",
    latitude: 6.6212,
    longitude: 3.3831,
  },
  {
    id: "loc-lag-8",
    name: "Gbagada Phase 2",
    address: "Diya Street, Gbagada, Lagos",
    area: "Gbagada",
    city: "Kosofe",
    state: "Lagos",
    latitude: 6.5544,
    longitude: 3.3887,
  },
  {
    id: "loc-lag-9",
    name: "Festac Town",
    address: "21 Road, Festac Town, Amuwo-Odofin, Lagos",
    area: "Festac Town",
    city: "Amuwo-Odofin",
    state: "Lagos",
    latitude: 6.4678,
    longitude: 3.2833,
  },
  {
    id: "loc-lag-10",
    name: "Maryland",
    address: "Mobolaji Bank Anthony Way, Maryland, Ikeja, Lagos",
    area: "Maryland",
    city: "Ikeja",
    state: "Lagos",
    latitude: 6.5744,
    longitude: 3.3664,
  },
  {
    id: "loc-abj-1",
    name: "Maitama",
    address: "Aguiyi Ironsi Street, Maitama, Abuja",
    area: "Maitama",
    city: "Abuja",
    state: "Federal Capital Territory",
    latitude: 9.0882,
    longitude: 7.4934,
  },
  {
    id: "loc-abj-2",
    name: "Wuse 2",
    address: "Adetokunbo Ademola Crescent, Wuse 2, Abuja",
    area: "Wuse 2",
    city: "Abuja",
    state: "Federal Capital Territory",
    latitude: 9.0765,
    longitude: 7.4722,
  },
];

/**
 * Autocomplete address search function
 * Queries Nominatim / external map provider if available, with instant curated Nigerian fallback
 */
export async function searchLocationsApi(query: string): Promise<GeocodedLocation[]> {
  if (!query || !query.trim()) {
    return POPULAR_NIGERIAN_LOCATIONS.slice(0, 5);
  }

  const clean = query.toLowerCase().trim();

  // 1. Check local curated database first for instant matches
  const localMatches = POPULAR_NIGERIAN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(clean) ||
      loc.address.toLowerCase().includes(clean) ||
      loc.area.toLowerCase().includes(clean) ||
      loc.city.toLowerCase().includes(clean) ||
      loc.state.toLowerCase().includes(clean)
  );

  // 2. If online search query is at least 3 chars, query Nominatim OSM as an enhancement
  if (clean.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${query}, Nigeria`
      )}&format=json&addressdetails=1&limit=5`;

      const res = await fetch(endpoint, {
        headers: { "Accept-Language": "en" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const apiResults: GeocodedLocation[] = data.map((item, idx) => ({
            id: `osm-${item.place_id || idx}`,
            name: item.display_name.split(",")[0] || query,
            address: item.display_name,
            area: item.address?.suburb || item.address?.neighbourhood || item.address?.city || "",
            city: item.address?.city || item.address?.town || item.address?.state_district || "Lagos",
            state: item.address?.state || "Lagos",
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          }));

          // Deduplicate and combine with local matches
          const combined = [...localMatches];
          for (const item of apiResults) {
            if (!combined.some((c) => Math.abs(c.latitude - item.latitude) < 0.001)) {
              combined.push(item);
            }
          }
          return combined;
        }
      }
    } catch {
      // Fallback silently to local matches
    }
  }

  // 3. Fallback: If no exact matches found, generate a dynamic approximate geocode
  if (localMatches.length === 0) {
    return [
      {
        id: `custom-${Date.now()}`,
        name: query,
        address: `${query}, Lagos, Nigeria`,
        area: query,
        city: "Lagos",
        state: "Lagos",
        latitude: 6.5244,
        longitude: 3.3792,
      },
    ];
  }

  return localMatches;
}

/**
 * Reverse geocode latitude/longitude to a readable location description
 */
export async function reverseGeocodeApi(
  lat: number,
  lng: number
): Promise<GeocodedLocation | null> {
  // Find closest curated location
  let closest = POPULAR_NIGERIAN_LOCATIONS[0];
  let minDiff = Infinity;

  for (const loc of POPULAR_NIGERIAN_LOCATIONS) {
    const diff = Math.hypot(loc.latitude - lat, loc.longitude - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = loc;
    }
  }

  return {
    ...closest,
    latitude: lat,
    longitude: lng,
  };
}

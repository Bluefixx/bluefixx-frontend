"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  acceptOfferApi,
  counterOfferApi,
  getQuoteNegotiationApi,
  NegotiationState,
} from "@/lib/api/quotes";
import { getSocket, emitWithAck } from "@/lib/realtime/socket";
import { formatNaira, nairaToKobo } from "@/lib/utils/currency";
import { generateIdempotencyKey } from "@/lib/utils/idempotency";

interface LiveNegotiationPanelProps {
  quoteId: string;
  role: "CUSTOMER" | "ARTISAN";
  onAccepted?: (bookingId?: string | null) => void;
}

export function LiveNegotiationPanel({
  quoteId,
  role,
  onAccepted,
}: LiveNegotiationPanelProps) {
  const [state, setState] = useState<NegotiationState | null>(null);
  const [counterNaira, setCounterNaira] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getQuoteNegotiationApi(quoteId)
      .then((res) => {
        if (mounted) setState(res);
      })
      .catch(() => {
        if (mounted) setState(null);
      });

    const socket = getSocket();
    if (!socket) {
      return () => {
        mounted = false;
      };
    }

    const join = () => {
      emitWithAck<NegotiationState>(socket, "negotiation.join", { quoteId })
        .then((res) => {
          if (mounted && res && res.quoteId === quoteId) {
            setState(res);
          }
        })
        .catch(() => {});
    };

    if (socket.connected) join();
    socket.on("connect", join);

    const onUpdated = (payload: NegotiationState) => {
      if (mounted && payload?.quoteId === quoteId) {
        setState(payload);
      }
    };

    const onAcceptedEvent = (payload: { quoteId?: string; bookingId?: string }) => {
      if (!mounted || payload?.quoteId !== quoteId) return;
      getQuoteNegotiationApi(quoteId)
        .then((res) => {
          if (mounted) setState(res);
        })
        .catch(() => {});
      onAccepted?.(payload.bookingId);
    };

    socket.on("negotiation.updated", onUpdated);
    socket.on("negotiation.accepted", onAcceptedEvent);

    return () => {
      mounted = false;
      socket.off("connect", join);
      socket.off("negotiation.updated", onUpdated);
      socket.off("negotiation.accepted", onAcceptedEvent);
    };
  }, [quoteId, onAccepted]);

  if (!state || !state.offer) {
    return null;
  }

  const offer = state.offer;
  const isMyTurn = state.turn === role && state.status === "OPEN" && offer.status === "OPEN";
  const displayAmount = role === "CUSTOMER" ? offer.customerTotal : offer.artisanEarnings;

  const handleCounter = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const numeric = parseFloat(counterNaira.replace(/,/g, ""));
    if (!numeric || numeric <= 0) {
      toast.error("Enter a valid counter-offer amount in Naira.");
      return;
    }
    setIsSubmitting(true);
    try {
      const next = await counterOfferApi(
        quoteId,
        nairaToKobo(numeric),
        offer.version,
        generateIdempotencyKey()
      );
      setState(next);
      setCounterNaira("");
      toast.success("Counter-offer sent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send counter-offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const booking = await acceptOfferApi(offer.id, generateIdempotencyKey());
      toast.success("Offer accepted! Booking created.");
      const updated = await getQuoteNegotiationApi(quoteId).catch(() => null);
      if (updated) setState(updated);
      onAccepted?.(booking?.id ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not accept offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
          Live Negotiation
        </span>
        <span className="text-[11px] font-semibold text-neutral-500">
          Round {state.round}/{state.maxRounds}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[11px] text-neutral-500 block">
            {role === "CUSTOMER" ? "Current total" : "Your earnings"}
          </span>
          <span className="text-lg font-heading font-extrabold text-[#001B40]">
            {formatNaira(displayAmount, true)}
          </span>
        </div>
        {offer.budgetPosition && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-neutral-200 text-neutral-700">
            {offer.budgetPosition} BUDGET
          </span>
        )}
      </div>

      <div className="text-[11px] text-neutral-600">
        {state.status !== "OPEN" ? (
          <span className="font-semibold text-emerald-700">Status: {state.status}</span>
        ) : isMyTurn ? (
          <span className="font-semibold text-blue-700">Your turn to respond</span>
        ) : (
          <span>Waiting for {state.turn === "CUSTOMER" ? "customer" : "artisan"} response</span>
        )}
      </div>

      {isMyTurn && (
        <div className="space-y-2.5 pt-1">
          <form onSubmit={handleCounter} className="flex gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={counterNaira}
              onChange={(e) => setCounterNaira(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCounter();
                }
              }}
              placeholder="Counter ₦"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 focus:outline-hidden focus:border-[#001B40]"
            />
            <button
              type="button"
              onClick={() => void handleCounter()}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl border border-[#001B40] text-[#001B40] hover:bg-[#001B40] hover:text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Counter
            </button>
          </form>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAccept}
            className="w-full py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Accept {formatNaira(displayAmount, true)}
          </button>
        </div>
      )}
    </div>
  );
}

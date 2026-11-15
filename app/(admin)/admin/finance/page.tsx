"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AdminBankAccount,
  AdminRefund,
  AdminTransfer,
  approvePayoutBankApi,
  decideWithdrawalApi,
  finalizeTransferApi,
  getAdminBanksApi,
  getAdminRefundsApi,
  getAdminTransfersApi,
  getAdminWithdrawalsApi,
  reconcileRefundApi,
  retryTransferApi,
} from "@/lib/api/admin-finance";

function formatKobo(koboStr: string): string {
  const naira = Math.round(Number(koboStr || 0) / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

export default function AdminFinancePage() {
  const [tab, setTab] = useState<"withdrawals" | "transfers" | "banks" | "refunds">("withdrawals");
  const [withdrawals, setWithdrawals] = useState<AdminTransfer[]>([]);
  const [transfers, setTransfers] = useState<AdminTransfer[]>([]);
  const [banks, setBanks] = useState<AdminBankAccount[]>([]);
  const [refunds, setRefunds] = useState<AdminRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [w, t, b, r] = await Promise.all([
        getAdminWithdrawalsApi().catch(() => []),
        getAdminTransfersApi().catch(() => []),
        getAdminBanksApi().catch(() => []),
        getAdminRefundsApi().catch(() => []),
      ]);
      setWithdrawals(Array.isArray(w) ? w : []);
      setTransfers(Array.isArray(t) ? t : []);
      setBanks(Array.isArray(b) ? b : []);
      setRefunds(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleWithdrawalDecision = async (id: string, decision: "APPROVE" | "REJECT") => {
    const reason =
      decision === "APPROVE"
        ? "Approved by admin finance review"
        : window.prompt("Reason for rejecting withdrawal:", "Verification failed") || "";
    if (!reason.trim()) return;

    setBusyId(id);
    try {
      await decideWithdrawalApi(id, { decision, reason });
      toast.success(`Withdrawal ${decision === "APPROVE" ? "approved" : "rejected"}.`);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update withdrawal.");
    } finally {
      setBusyId(null);
    }
  };

  const handleFinalizeTransfer = async (id: string) => {
    const otp = (otpInputs[id] || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit Paystack transfer OTP.");
      return;
    }
    setBusyId(id);
    try {
      await finalizeTransferApi(id, otp);
      toast.success("Transfer finalized and processing.");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to finalize transfer.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRetryTransfer = async (id: string) => {
    setBusyId(id);
    try {
      await retryTransferApi(id);
      toast.success("Transfer retried.");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to retry transfer.");
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveBank = async (id: string, approved: boolean) => {
    setBusyId(id);
    try {
      await approvePayoutBankApi(id, {
        approved,
        reason: approved ? "Verified payout bank account" : "Payout approval revoked",
      });
      toast.success(approved ? "Payout bank approved." : "Payout bank revoked.");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update bank approval.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReconcileRefund = async (id: string) => {
    setBusyId(id);
    try {
      await reconcileRefundApi(id);
      toast.success("Refund reconciled.");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reconcile refund.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#001B40]">
            Admin Finance & Escrow Payouts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review withdrawal requests, Paystack transfers, payout bank accounts, and refunds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-semibold cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        {(["withdrawals", "transfers", "banks", "refunds"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize cursor-pointer ${
              tab === t
                ? "bg-[#001B40] text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading finance queue...</div>
      ) : tab === "withdrawals" ? (
        <div className="space-y-3">
          {withdrawals.length === 0 && (
            <p className="text-sm text-neutral-500 py-8 text-center">No withdrawal requests.</p>
          )}
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-[#001B40]">
                  {formatKobo(w.amount)} · <span className="text-xs font-semibold">{w.status}</span>
                </div>
                <div className="text-xs text-neutral-500">Ref: {w.reference}</div>
              </div>
              {w.status === "REQUESTED" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === w.id}
                    onClick={() => void handleWithdrawalDecision(w.id, "APPROVE")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Approve & Payout
                  </button>
                  <button
                    type="button"
                    disabled={busyId === w.id}
                    onClick={() => void handleWithdrawalDecision(w.id, "REJECT")}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : tab === "transfers" ? (
        <div className="space-y-3">
          {transfers.length === 0 && (
            <p className="text-sm text-neutral-500 py-8 text-center">No transfers in queue.</p>
          )}
          {transfers.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-[#001B40]">
                  {t.kind} · {formatKobo(t.amount)} · {t.status}
                </div>
                <div className="text-xs text-neutral-500">Ref: {t.reference}</div>
              </div>
              <div className="flex items-center gap-2">
                {t.status === "OTP" && (
                  <>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={otpInputs[t.id] || ""}
                      onChange={(e) =>
                        setOtpInputs((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs w-28"
                    />
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => void handleFinalizeTransfer(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#001B40] text-white text-xs font-semibold cursor-pointer"
                    >
                      Finalize
                    </button>
                  </>
                )}
                {t.status === "FAILED" && (
                  <button
                    type="button"
                    disabled={busyId === t.id}
                    onClick={() => void handleRetryTransfer(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Retry Transfer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : tab === "banks" ? (
        <div className="space-y-3">
          {banks.length === 0 && (
            <p className="text-sm text-neutral-500 py-8 text-center">No payout bank accounts.</p>
          )}
          {banks.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-[#001B40]">
                  {b.accountName} · ••••{b.last4}
                </div>
                <div className="text-xs text-neutral-500">
                  Bank Code: {b.bankCode} · {b.approvedForPayout ? "Approved" : "Pending Approval"}
                </div>
              </div>
              <button
                type="button"
                disabled={busyId === b.id}
                onClick={() => void handleApproveBank(b.id, !b.approvedForPayout)}
                className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold cursor-pointer ${
                  b.approvedForPayout ? "bg-neutral-600" : "bg-emerald-600"
                }`}
              >
                {b.approvedForPayout ? "Revoke Payout" : "Approve Payout"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.length === 0 && (
            <p className="text-sm text-neutral-500 py-8 text-center">No refunds pending.</p>
          )}
          {refunds.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-[#001B40]">
                  {formatKobo(r.amount)} · {r.status}
                </div>
                <div className="text-xs text-neutral-500">{r.reason || r.paymentId}</div>
              </div>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => void handleReconcileRefund(r.id)}
                className="px-3 py-1.5 rounded-lg bg-[#001B40] text-white text-xs font-semibold cursor-pointer"
              >
                Reconcile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

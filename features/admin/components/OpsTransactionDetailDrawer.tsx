"use client";

import React from "react";
import { AdminTransaction } from "../types";

interface OpsTransactionDetailDrawerProps {
  transaction: AdminTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onForceRelease: (tx: AdminTransaction) => void;
  onIssueRefund: (tx: AdminTransaction) => void;
}

export function OpsTransactionDetailDrawer({
  transaction,
  isOpen,
  onClose,
  onForceRelease,
  onIssueRefund,
}: OpsTransactionDetailDrawerProps) {
  if (!isOpen || !transaction) return null;

  const getStatusBadge = (status: AdminTransaction["status"]) => {
    switch (status) {
      case "IN_ESCROW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            In Escrow
          </span>
        );
      case "HOLDING":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Holding
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Released
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            Disputed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
            Refunded
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            Failed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-start justify-between">
            <div>
              <div className="text-[11px] text-neutral-400 font-semibold tracking-wide">
                Transactions & Finance — All transactions
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-neutral-900 font-mono">
                  Transaction {transaction.id}
                </h2>
                {getStatusBadge(transaction.status)}
                <span className="text-xs text-neutral-500">
                  {transaction.method} · {transaction.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {transaction.status === "IN_ESCROW" && (
                <button
                  type="button"
                  onClick={() => onForceRelease(transaction)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs"
                >
                  Force Release
                </button>
              )}

              {(transaction.status === "IN_ESCROW" ||
                transaction.status === "HOLDING" ||
                transaction.status === "DISPUTED") && (
                <button
                  type="button"
                  onClick={() => onIssueRefund(transaction)}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Issue Refund
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Drawer Body (2-Column Layout matching Screenshots 1-4) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Money Split 3-Card Banner */}
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Money Split (Customer payment, Bluefixx revenue and worker earnings are strictly separated)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Customer Payment</span>
                  <div className="font-extrabold text-lg text-neutral-900 mt-0.5">
                    ₦{transaction.grossAmount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Charged via {transaction.method}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Bluefixx Platform Fee</span>
                  <div className="font-extrabold text-lg text-blue-900 mt-0.5">
                    ₦{transaction.platformFee.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-blue-700 mt-1 block">
                    10% commission: platform revenue
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Worker Earnings</span>
                  <div className="font-extrabold text-lg text-emerald-900 mt-0.5">
                    ₦{transaction.workerEarnings.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block">
                    Released upon completion sign-off
                  </span>
                </div>
              </div>
            </div>

            {/* Split Details & Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (7 cols): Summary & Refund History */}
              <div className="lg:col-span-7 space-y-4">
                {/* Transaction Summary Card */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <h4 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Transaction Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Customer</span>
                      <span className="font-bold text-neutral-900 mt-0.5 block">
                        {transaction.customer.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {transaction.customer.code}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Worker</span>
                      <span className="font-bold text-neutral-900 mt-0.5 block">
                        {transaction.worker.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {transaction.worker.code} • {transaction.worker.trade}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Job Reference</span>
                      <span className="font-mono font-bold text-[#001B40] mt-0.5 block">
                        {transaction.job.id}
                      </span>
                      <span className="text-[10px] text-neutral-500 truncate block">
                        {transaction.job.title}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Initiated Date</span>
                      <span className="text-neutral-800 font-medium mt-0.5 block">
                        {transaction.date}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400 block">
                        Ref: {transaction.gatewayRef}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refund History Card */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <h4 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Refund History
                  </h4>

                  {transaction.refundHistory && transaction.refundHistory.length > 0 ? (
                    <div className="space-y-2">
                      {transaction.refundHistory.map((rf) => (
                        <div
                          key={rf.id}
                          className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-neutral-900">{rf.id}</span>
                            <span className="text-rose-700">₦{rf.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600">{rf.reason}</p>
                          <div className="text-[10px] text-neutral-400 flex justify-between pt-1 border-t border-neutral-200">
                            <span>Admin: {rf.admin}</span>
                            <span>{rf.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-400">
                      No refunds on this transaction. Refunds appear here with reasons, admin ID and settlement route.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Payment Timeline & Audit History */}
              <div className="lg:col-span-5 space-y-4">
                {/* Payment Timeline */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                  <h4 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Payment Timeline
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-bold text-neutral-800">Payment Initiated</div>
                        <div className="text-[10px] text-neutral-400">{transaction.timeline.paymentInitiated}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          transaction.status === "FAILED" ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-neutral-800">Funds Held in Escrow</div>
                        <div className="text-[10px] text-neutral-400">
                          {transaction.timeline.fundsHeldInEscrow}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          transaction.timeline.jobCompleted?.includes("complete")
                            ? "bg-emerald-500"
                            : "bg-neutral-300"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-neutral-800">Job Completed</div>
                        <div className="text-[10px] text-neutral-400">
                          {transaction.timeline.jobCompleted || "In Progress"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          transaction.status === "RELEASED"
                            ? "bg-emerald-500"
                            : transaction.status === "REFUNDED"
                            ? "bg-neutral-400"
                            : "bg-neutral-300"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-neutral-800">Payout Released</div>
                        <div className="text-[10px] text-neutral-400">
                          {transaction.timeline.payoutReleased || "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Job Card */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] text-neutral-500 uppercase">Related Job</span>
                    <span className="font-mono font-bold text-[#001B40]">{transaction.job.id}</span>
                  </div>
                  <div className="font-bold text-neutral-900">{transaction.job.title}</div>
                  <div className="text-[11px] text-neutral-500">
                    {transaction.job.trade} • {transaction.job.location}
                  </div>
                </div>

                {/* Audit History */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-2 text-xs">
                  <h4 className="font-bold text-[11px] uppercase text-neutral-500 tracking-wider">
                    Audit History
                  </h4>
                  <div className="space-y-2">
                    {transaction.auditHistory.map((a) => (
                      <div key={a.id} className="text-[11px] p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div className="font-semibold text-neutral-800">{a.action}</div>
                        <div className="text-[10px] text-neutral-400 flex justify-between mt-0.5">
                          <span>{a.actor}</span>
                          <span>{a.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

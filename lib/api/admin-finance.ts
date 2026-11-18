import { apiClient } from "./client";

export interface AdminTransfer {
  id: string;
  userId: string;
  bankId?: string;
  kind: "PAYOUT" | "WITHDRAWAL";
  status: string;
  amount: string;
  reference: string;
  reason?: string | null;
  createdAt: string;
}

export interface AdminBankAccount {
  id: string;
  userId: string;
  bankCode: string;
  last4: string;
  accountName: string;
  approvedForPayout: boolean;
  createdAt: string;
}

export interface AdminRefund {
  id: string;
  paymentId: string;
  status: string;
  amount: string;
  reason?: string | null;
  createdAt: string;
}

export async function getAdminWithdrawalsApi(status?: string): Promise<AdminTransfer[]> {
  return apiClient.get("/admin/withdrawals", { params: status ? { status } : undefined });
}

export async function decideWithdrawalApi(
  id: string,
  payload: { decision: "APPROVE" | "REJECT"; reason: string }
): Promise<AdminTransfer> {
  return apiClient.post(`/admin/withdrawals/${id}/decision`, payload);
}

export async function getAdminTransfersApi(): Promise<AdminTransfer[]> {
  return apiClient.get("/admin/transfers");
}

export async function finalizeTransferApi(
  id: string,
  otp: string
): Promise<{ status: string }> {
  return apiClient.post(`/admin/transfers/${id}/finalize`, { otp });
}

export async function retryTransferApi(id: string): Promise<AdminTransfer> {
  return apiClient.post(`/admin/transfers/${id}/retry`, {});
}

export async function getAdminBanksApi(): Promise<AdminBankAccount[]> {
  return apiClient.get("/admin/banks");
}

export async function approvePayoutBankApi(
  id: string,
  payload: { approved: boolean; reason: string }
): Promise<{ approvedForPayout: boolean }> {
  return apiClient.post(`/admin/banks/${id}/approve-payout`, payload);
}

export async function getAdminRefundsApi(): Promise<AdminRefund[]> {
  return apiClient.get("/admin/refunds");
}

export async function reconcileRefundApi(id: string): Promise<AdminRefund> {
  return apiClient.post(`/admin/refunds/${id}/reconcile`, {});
}

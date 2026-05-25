import { apiClient } from "../lib/apiClient";
import type { AuthUser } from "../types/role.types";

export type AccountSummary = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  enterpriseName: string | null;
  category: string | null;
  managerName: string | null;
  barangay: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  locationSource: string | null;
  locationConfidence: number | null;
  geocodedAddress: string | null;
  locationUpdatedAt: string | null;
  enterpriseId: string | null;
  gatewayStatus: string | null;
  displayName: string;
  role: string;
  title: string;
  status: "active" | "inactive";
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type DevDelivery = {
  id: string;
  accountId: string;
  channel: "email" | "sms";
  recipient: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
};

export type CreateLguAccountPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "admin" | "it" | "staff";
};

export type CreateEnterpriseAccountPayload = {
  enterpriseName: string;
  category: string;
  managerName: string;
  email: string;
  contactNumber?: string;
  barangay: string;
  address: string;
  enterpriseId?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: string;
  locationConfidence?: number;
  geocodedAddress?: string;
};

export type EnterpriseGeocodePayload = {
  enterpriseName?: string;
  barangay: string;
  address: string;
};

export type EnterpriseGeocodeResult = {
  latitude: number;
  longitude: number;
  displayAddress: string;
  confidence: number | null;
  provider: string;
  source: string;
};

export async function listLguAccounts() {
  const response = await apiClient.get<AccountSummary[]>("/accounts/lgu");
  return response.data;
}

export async function createLguAccount(payload: CreateLguAccountPayload) {
  const response = await apiClient.post<AccountSummary>("/accounts/lgu", payload);
  return response.data;
}

export async function listEnterpriseAccounts() {
  const response = await apiClient.get<AccountSummary[]>("/accounts/enterprises");
  return response.data;
}

export async function createEnterpriseAccount(payload: CreateEnterpriseAccountPayload) {
  const response = await apiClient.post<AccountSummary>("/accounts/enterprises", payload);
  return response.data;
}

export async function geocodeEnterpriseAddress(payload: EnterpriseGeocodePayload) {
  const response = await apiClient.post<EnterpriseGeocodeResult>("/accounts/enterprises/geocode", payload);
  return response.data;
}

export async function resetAccountPassword(accountId: string) {
  const response = await apiClient.post<AccountSummary>(`/accounts/${accountId}/reset-password`);
  return response.data;
}

export async function updateAccountStatus(accountId: string, status: "active" | "inactive") {
  const response = await apiClient.patch<AccountSummary>(`/accounts/${accountId}/status`, { status });
  return response.data;
}

export async function listDevDeliveries() {
  const response = await apiClient.get<DevDelivery[]>("/dev/deliveries");
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await apiClient.post("/auth/change-password", { currentPassword, newPassword });
  return response.data as { token: string; user: AuthUser };
}

export async function getCurrentUser() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

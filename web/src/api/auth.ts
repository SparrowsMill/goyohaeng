import { apiRequest } from "./client";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface BusinessPlaceSummary {
  id: number;
  name: string;
}

export interface BusinessAccountSummary {
  id: number;
  status: ApprovalStatus;
  rejectionReason: string | null;
  place: BusinessPlaceSummary | null;
}

export interface LoginUser {
  id: number;
  username: string;
  realName: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUser;
  businessAccount: BusinessAccountSummary;
}

export interface SignupPayload {
  username: string;
  password: string;
  realName: string;
  birthDate: string;
  email: string;
  phone?: string;
  businessName: string;
  businessRegistrationNo: string;
  submittedStoreAddress: string;
}

export interface SignupResponse {
  userId: number;
  businessAccountId: number;
  username: string;
  place: null;
  approvalStatus: "PENDING";
  message: string;
}

export interface CheckUsernameResponse {
  username: string;
  available: boolean;
}

export function checkUsername(username: string) {
  return apiRequest<CheckUsernameResponse>("/business/auth/check-username", {
    auth: false,
    query: { username },
  });
}

export function signup(payload: SignupPayload) {
  return apiRequest<SignupResponse>("/business/auth/signup", {
    method: "POST",
    auth: false,
    body: payload,
  });
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/business/auth/login", {
    method: "POST",
    auth: false,
    body: { username, password },
  });
}

export interface ApprovalStatusResponse {
  status: ApprovalStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  place: (BusinessPlaceSummary & { roadAddress: string | null }) | null;
}

export function getApprovalStatus() {
  return apiRequest<ApprovalStatusResponse>("/business/me/approval-status");
}

export interface MyAccount {
  id: number;
  status: ApprovalStatus;
  rejectionReason: string | null;
  account: {
    userId: number;
    username: string;
    realName: string | null;
    birthDate: string | null;
    phone: string | null;
    email: string | null;
  };
  business: {
    businessName: string;
    businessRegistrationNo: string;
    submittedStoreAddress: string;
  };
  place: (BusinessPlaceSummary & { roadAddress: string | null }) | null;
}

export function getMyAccount() {
  return apiRequest<MyAccount>("/business/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ message: string }>("/business/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

export function deleteMyAccount() {
  return apiRequest<{ message: string }>("/business/me", { method: "DELETE" });
}

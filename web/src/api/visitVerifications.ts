import { apiRequest } from "./client";
import type { VerificationStatus } from "./dashboard";

export interface VisitVerificationListItem {
  id: number;
  verificationCode: string;
  status: VerificationStatus;
  expectedArrivalAt: string | null;
  issuedAt: string;
  expiresAt: string;
  verifiedAt: string | null;
  failReason: string | null;
  user: { id: number; realName: string | null };
}

export interface VisitVerificationListResponse {
  items: VisitVerificationListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VisitVerificationListQuery {
  status?: VerificationStatus;
  code?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function getVisitVerifications(query: VisitVerificationListQuery = {}) {
  return apiRequest<VisitVerificationListResponse>("/business/visit-verifications", { query });
}

export interface VisitVerificationDetail {
  id: number;
  verificationCode: string;
  status: VerificationStatus;
  arrivalOptionMinutes: number | null;
  expectedArrivalAt: string | null;
  issuedAt: string;
  expiresAt: string;
  verifiedAt: string | null;
  failReason: string | null;
  user: { id: number; realName: string | null };
  place: { id: number; name: string };
}

export function getVisitVerification(id: number) {
  return apiRequest<VisitVerificationDetail>(`/business/visit-verifications/${id}`);
}

export interface VisitVerificationSummary {
  activeSessionCount: number;
  todayVerifiedCount: number;
  todayExpiredCount: number;
}

export function getVisitVerificationSummary() {
  return apiRequest<VisitVerificationSummary>("/business/visit-verifications/summary");
}

export interface IntakeSetting {
  enabled: boolean;
  controlMode: string;
  hoursMode: "SAME_AS_OPERATING" | "CUSTOM";
  manualAvailable: boolean | null;
  codeValidMinutes: number;
  updatedAt: string | null;
}

export function getIntakeSetting() {
  return apiRequest<IntakeSetting>("/business/visit-verifications/intake-setting");
}

export function updateIntakeSetting(enabled: boolean) {
  return apiRequest<IntakeSetting & { message: string }>(
    "/business/visit-verifications/intake-setting",
    { method: "PATCH", body: { enabled } }
  );
}

export interface VerificationHourItem {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface VerificationHoursResponse {
  hoursMode: "SAME_AS_OPERATING" | "CUSTOM";
  hours: VerificationHourItem[];
}

export function getVerificationHours() {
  return apiRequest<VerificationHoursResponse>("/business/visit-verifications/verification-hours");
}

export function updateVerificationHours(payload: {
  hoursMode: "SAME_AS_OPERATING" | "CUSTOM";
  hours?: VerificationHourItem[];
}) {
  return apiRequest<VerificationHoursResponse>(
    "/business/visit-verifications/verification-hours",
    { method: "PUT", body: payload }
  );
}

export interface ApproveVerificationResponse {
  verification: {
    id: number;
    userId: number;
    placeId: number;
    arrivalOptionMinutes: number | null;
    expectedArrivalAt: string | null;
    verificationCode: string;
    issuedAt: string;
    expiresAt: string;
    status: VerificationStatus;
    verifiedAt: string | null;
    failReason: string | null;
    createdAt: string;
  };
  message: string;
}

export function approveVerification(id: number) {
  return apiRequest<ApproveVerificationResponse>(`/business/visit-verifications/${id}/approve`, {
    method: "POST",
  });
}

export interface RejectVerificationResponse {
  verification: {
    id: number;
    verificationCode: string;
    status: VerificationStatus;
    failReason: string | null;
    verifiedAt: string | null;
  } | null;
  message: string;
}

export function rejectVerification(id: number, reason: string) {
  return apiRequest<RejectVerificationResponse>(`/business/visit-verifications/${id}/reject`, {
    method: "POST",
    body: { reason },
  });
}

// 재방문 분석(/business/analytics/revisit)과 같은 기준(VERIFIED 건수)으로 고객 1명의
// 누적 방문 횟수를 센다. 전용 API가 없어 목록을 페이지네이션으로 순회해 집계한다.
export async function getCustomerVerifiedVisitCount(userId: number) {
  let count = 0;
  let page = 1;
  const limit = 100;
  const MAX_PAGES = 10;
  while (page <= MAX_PAGES) {
    const res = await getVisitVerifications({ status: "VERIFIED", page, limit });
    count += res.items.filter((item) => item.user.id === userId).length;
    if (page >= res.totalPages) break;
    page += 1;
  }
  return count;
}

import { apiRequest } from "./client";

export type VerificationStatus = "ISSUED" | "VERIFIED" | "EXPIRED" | "FAILED" | "CANCELLED";

export interface DashboardResponse {
  placeId: number;
  summary: {
    pendingCount: number;
    todayIssuedCount: number;
    todayVerifiedCount: number;
    last7DaysVerifiedCount: number;
    totalVerifiedCount: number;
  };
  dailyVerifiedCounts: { date: string; count: number }[];
  recentVerifications: {
    id: number;
    userId: number;
    username: string;
    realName: string | null;
    verificationCode: string;
    status: VerificationStatus;
    expectedArrivalAt: string | null;
    issuedAt: string;
    expiresAt: string;
    verifiedAt: string | null;
    failReason: string | null;
  }[];
}

export function getDashboard() {
  return apiRequest<DashboardResponse>("/business/dashboard");
}

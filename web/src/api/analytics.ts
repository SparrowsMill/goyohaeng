import { apiRequest } from "./client";

export interface RevisitAnalytics {
  placeId: number;
  totalUniqueVisitors: number;
  firstTimeVisitorCount: number;
  returningVisitorCount: number;
  revisitRate: number;
  totalVerifiedVisits: number;
  revisitVisitCount: number;
  revisitVisitRate: number;
  visitFrequency: { oneVisit: number; twoVisits: number; threeOrMoreVisits: number };
}

export function getRevisitAnalytics() {
  return apiRequest<RevisitAnalytics>("/business/analytics/revisit");
}

export interface VerificationFunnel {
  placeId: number;
  totalRequestedCount: number;
  funnel: {
    pending: { count: number; rate: number };
    verified: { count: number; rate: number };
    rejected: { count: number; rate: number };
    cancelled: { count: number; rate: number };
    expired: { count: number; rate: number };
  };
  resolvedCount: number;
  verificationRate: number;
  approvalRateAmongResolved: number;
}

export function getVerificationFunnel() {
  return apiRequest<VerificationFunnel>("/business/analytics/verification-funnel");
}

interface NaverInterestPoint {
  periodStart: string;
  ratio: number;
}

export type NaverAnalytics =
  | {
      placeId: number;
      placeName: string;
      available: false;
      searchTerm: null;
      searchTermVersion: null;
      latestInterest: null;
      previousInterest: null;
      difference: null;
      direction: null;
      history: [];
    }
  | {
      placeId: number;
      placeName: string;
      available: boolean;
      searchTerm: string;
      searchTermVersion: number;
      searchTermUpdatedAt: string;
      latestInterest: NaverInterestPoint | null;
      previousInterest: NaverInterestPoint | null;
      difference: number | null;
      direction: "UP" | "DOWN" | "SAME" | null;
      history: NaverInterestPoint[];
    };

export function getNaverAnalytics() {
  return apiRequest<NaverAnalytics>("/business/analytics/naver");
}

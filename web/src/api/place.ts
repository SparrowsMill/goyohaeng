import { apiRequest } from "./client";

export interface PlaceImageSummary {
  id: number;
  originalUrl: string;
  thumbnailUrl: string | null;
  displayOrder: number | null;
}

export interface PlaceDetail {
  id: number;
  name: string;
  categoryId: number | null;
  category: { id: number; name: string } | null;
  roadAddress: string | null;
  lotAddress: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  homepage: string | null;
  overview: string | null;
  status: string;
  images: PlaceImageSummary[];
  createdAt: string;
  updatedAt: string | null;
}

export function getPlace() {
  return apiRequest<PlaceDetail>("/business/place");
}

export interface UpdatePlacePayload {
  name?: string;
  phone?: string | null;
  homepage?: string | null;
  overview?: string | null;
}

export function updatePlace(payload: UpdatePlacePayload) {
  return apiRequest<PlaceDetail>("/business/place", { method: "PATCH", body: payload });
}

// 장소 사진 (URL 등록 방식)
export interface PlaceImage {
  id: number;
  placeId: number;
  uploadedByUserId: number | null;
  imageName: string | null;
  originalUrl: string;
  thumbnailUrl: string | null;
  displayOrder: number | null;
  isActive: boolean;
  createdAt: string;
}

export function getPlaceImages() {
  return apiRequest<{ placeId: number; items: PlaceImage[] }>("/business/place/images");
}

export interface PlaceImagePayload {
  originalUrl: string;
  thumbnailUrl?: string | null;
  imageName?: string | null;
  displayOrder?: number;
}

export function createPlaceImage(payload: PlaceImagePayload) {
  return apiRequest<PlaceImage>("/business/place/images", { method: "POST", body: payload });
}

export function updatePlaceImage(id: number, payload: Partial<PlaceImagePayload>) {
  return apiRequest<PlaceImage>(`/business/place/images/${id}`, { method: "PATCH", body: payload });
}

export function deletePlaceImage(id: number) {
  return apiRequest<{ id: number; deleted: true }>(`/business/place/images/${id}`, { method: "DELETE" });
}

// 운영시간
export interface OperatingHourItem {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
}

export interface OperatingHoursResponse {
  placeId: number;
  hours: OperatingHourItem[];
}

export function getOperatingHours() {
  return apiRequest<OperatingHoursResponse>("/business/place/operating-hours");
}

export function updateOperatingHours(hours: OperatingHourItem[]) {
  return apiRequest<OperatingHoursResponse>("/business/place/operating-hours", {
    method: "PUT",
    body: { hours },
  });
}

// 특정일 영업 / 임시휴무
export type SpecialScheduleType = "CLOSED" | "SPECIAL_OPEN";

export interface SpecialHourItem {
  id: number;
  targetDate: string;
  scheduleType: SpecialScheduleType;
  openTime: string | null;
  closeTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  reason: string | null;
}

export interface SpecialHoursResponse {
  placeId: number;
  specialHours: SpecialHourItem[];
}

export function getSpecialHours() {
  return apiRequest<SpecialHoursResponse>("/business/place/special-hours");
}

export interface UpsertSpecialHourPayload {
  targetDate: string;
  scheduleType: SpecialScheduleType;
  openTime?: string | null;
  closeTime?: string | null;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  reason?: string | null;
}

export function upsertSpecialHour(payload: UpsertSpecialHourPayload) {
  return apiRequest<SpecialHoursResponse>("/business/place/special-hours", {
    method: "PUT",
    body: payload,
  });
}

export function deleteSpecialHour(targetDate: string) {
  return apiRequest<{ targetDate: string; deleted: true }>(
    `/business/place/special-hours/${targetDate}`,
    { method: "DELETE" }
  );
}

export function createTemporaryClosure(startDate: string, endDate: string, reason?: string | null) {
  return apiRequest<{ startDate: string; endDate: string; closedDays: number; reason: string | null }>(
    "/business/place/temporary-closures",
    { method: "POST", body: { startDate, endDate, reason } }
  );
}

// 혜택
export interface Benefit {
  id: number;
  placeId: number;
  title: string;
  description: string | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export function getBenefits() {
  return apiRequest<{ placeId: number; items: Benefit[] }>("/business/place/benefits");
}

export interface BenefitPayload {
  title: string;
  description?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
}

export function createBenefit(payload: BenefitPayload) {
  return apiRequest<Benefit>("/business/place/benefits", { method: "POST", body: payload });
}

export function updateBenefit(id: number, payload: Partial<BenefitPayload>) {
  return apiRequest<Benefit>(`/business/place/benefits/${id}`, { method: "PATCH", body: payload });
}

export function deleteBenefit(id: number) {
  return apiRequest<{ id: number; deleted: true }>(`/business/place/benefits/${id}`, {
    method: "DELETE",
  });
}

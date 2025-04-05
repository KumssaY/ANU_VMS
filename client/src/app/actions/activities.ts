//src/app/actions/activities.ts
import { PaginatedResponse, fetchFromAPI } from "./admin";
import { appendPaginationParams } from "./utils"

export type IncidentActivity = {
  description: string;
  id: number;
  recorded_at: string;
  recorded_by_id: number;
  visit_id: number;
  visitor_id: number;
};

export type ApprovedVisitActivity = {
  approved_by_id: number;
  duration: string | null;
  id: number;
  leave_time: string | null;
  left_approved_by_id: number | null;
  reason: string;
  status: string;
  visit_time: string;
  visitor_id: number;
};

export type ApprovedLeaveActivity = {
  approved_by_id: number;
  duration: string;
  id: number;
  leave_time: string;
  left_approved_by_id: number;
  reason: string;
  status: string;
  visit_time: string;
  visitor_id: number;
};

export type BanActivity = {
  id: number;
  is_active: boolean;
  issued_at: string;
  issued_by_id: number;
  lifted_at: string | null;
  lifted_by_id: number | null;
  reason: string;
  visitor_id: number;
};

// Updated function with proper activity types
export async function getSecurityPersonnelActivities<T extends IncidentActivity | ApprovedVisitActivity | ApprovedLeaveActivity | BanActivity>(
  securityUuid: string,
  activityType: 'incidents' | 'approved_visits' | 'approved_leaves' | 'issued_bans' | 'lifted_bans',
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<T>> {
  const baseUrl = `/api/admin/security-personnel/${securityUuid}/activities/${activityType}`;
  const url = appendPaginationParams(baseUrl, page, perPage);
  
  const data = await fetchFromAPI<{
    activities: T[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.activities,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

// Helper function to provide the correct type based on activity type
export function getActivitiesByType(
  securityUuid: string,
  activityType: 'incidents',
  page?: number,
  perPage?: number
): Promise<PaginatedResponse<IncidentActivity>>;
export function getActivitiesByType(
  securityUuid: string,
  activityType: 'approved_visits',
  page?: number,
  perPage?: number
): Promise<PaginatedResponse<ApprovedVisitActivity>>;
export function getActivitiesByType(
  securityUuid: string,
  activityType: 'approved_leaves',
  page?: number,
  perPage?: number
): Promise<PaginatedResponse<ApprovedLeaveActivity>>;
export function getActivitiesByType(
  securityUuid: string,
  activityType: 'issued_bans' | 'lifted_bans',
  page?: number,
  perPage?: number
): Promise<PaginatedResponse<BanActivity>>;
export function getActivitiesByType(
  securityUuid: string,
  activityType: 'incidents' | 'approved_visits' | 'approved_leaves' | 'issued_bans' | 'lifted_bans',
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<any>> {
  switch (activityType) {
    case 'incidents':
      return getSecurityPersonnelActivities<IncidentActivity>(securityUuid, activityType, page, perPage);
    case 'approved_visits':
      return getSecurityPersonnelActivities<ApprovedVisitActivity>(securityUuid, activityType, page, perPage);
    case 'approved_leaves':
      return getSecurityPersonnelActivities<ApprovedLeaveActivity>(securityUuid, activityType, page, perPage);
    case 'issued_bans':
    case 'lifted_bans':
      return getSecurityPersonnelActivities<BanActivity>(securityUuid, activityType, page, perPage);
  }
}
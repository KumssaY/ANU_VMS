// src/app/actions/security.ts

"use server";

import { cookies } from "next/headers";

// Types for security-related data
interface SecurityProfile {
  id: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  phone_number: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface ActivityCounts {
  visits_approved: number;
  leaves_approved: number;
  incidents_recorded: number;
  bans_issued: number;
  bans_lifted: number;
}

interface Visit {
  id: number;
  visitor_id: number;
  reason: string;
  visit_time: string;
  leave_time: string | null;
  approved_by_id: number;
  left_approved_by_id: number | null;
  status: string;
  duration: string | null;
}

interface Incident {
  id: number;
  visitor_id: number;
  visit_id: number;
  description: string;
  recorded_by_id: number;
  recorded_at: string;
}

interface Ban {
  id: number;
  visitor_id: number;
  reason: string;
  issued_at: string;
  lifted_at: string | null;
  issued_by_id: number;
  lifted_by_id: number | null;
  is_active: boolean;
}

interface Visitor {
  id: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  phone_number: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  image_path: string | null;
}

interface VisitorProfile extends Visitor {
  is_currently_banned: boolean;
  active_ban?: Ban;
}

interface PaginatedResponse<T> {
  current_page: number;
  pages: number;
  total: number;
  items: T[];
}

interface SecurityActivities {
  activity_counts: ActivityCounts;
  recent_activities: {
    recent_visits: Visit[];
    recent_incidents: Incident[];
  };
}

// Base URL for API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

// Helper function to get the auth token from cookies
const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};

// Helper for making authenticated API requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

/**
 * Fetch security personnel profile
 */
export async function getSecurityProfile(): Promise<SecurityProfile> {
  return fetchWithAuth("/security/profile");
}

/**
 * Fetch security personnel activities
 */
export async function getSecurityActivities(): Promise<SecurityActivities> {
  return fetchWithAuth("/security/activities");
}

/**
 * Fetch all visitors with pagination
 */
export async function getAllVisitors(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Visitor>> {
  const response = await fetchWithAuth(`/security/visitors?page=${page}&per_page=${perPage}`);
  
  return {
    items: response.visitors,
    current_page: response.current_page,
    pages: response.pages,
    total: response.total
  };
}

/**
 * Fetch a specific visitor by UUID
 */
export async function getVisitor(visitorUuid: string): Promise<Visitor> {
  return fetchWithAuth(`/security/visitors/${visitorUuid}`);
}

/**
 * Fetch visitor profile with ban status
 */
export async function getVisitorProfile(visitorUuid: string): Promise<VisitorProfile> {
  return fetchWithAuth(`/security/visitors/${visitorUuid}/profile`);
}

/**
 * Fetch visitor visits with pagination
 */
export async function getVisitorVisits(
  visitorUuid: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<PaginatedResponse<Visit>> {
  const response = await fetchWithAuth(`/security/visitors/${visitorUuid}/visits?page=${page}&per_page=${perPage}`);
  
  return {
    items: response.visits,
    current_page: response.current_page,
    pages: response.pages,
    total: response.total
  };
}

/**
 * Fetch visitor bans with pagination
 */
export async function getVisitorBans(
  visitorUuid: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<PaginatedResponse<Ban>> {
  const response = await fetchWithAuth(`/security/visitors/${visitorUuid}/bans?page=${page}&per_page=${perPage}`);
  
  return {
    items: response.bans,
    current_page: response.current_page,
    pages: response.pages,
    total: response.total
  };
}

/**
 * Fetch visitor incidents with pagination
 */
export async function getVisitorIncidents(
  visitorUuid: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<PaginatedResponse<Incident>> {
  const response = await fetchWithAuth(`/security/visitors/${visitorUuid}/incidents?page=${page}&per_page=${perPage}`);
  
  return {
    items: response.incidents,
    current_page: response.current_page,
    pages: response.pages,
    total: response.total
  };
}

/**
 * Check if a visitor is currently banned
 */
export async function getVisitorBanStatus(visitorUuid: string): Promise<{is_banned: boolean, ban_details: Ban | null}> {
  return fetchWithAuth(`/security/visitors/${visitorUuid}/ban-status`);
}

/**
 * Ban a visitor
 */
export async function banVisitor(
  visitorId: number, 
  reason: string, 
  secretCode: string
): Promise<{success: boolean; message: string}> {
  try {
    const response = await fetchWithAuth("/visitors/ban", {
      method: "POST",
      body: JSON.stringify({
        visitor_id: visitorId,
        reason,
        secret_code: secretCode
      })
    });
    
    return { success: true, message: "Visitor banned successfully" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to ban visitor" 
    };
  }
}

/**
 * Unban a visitor
 */
export async function unbanVisitor(
  visitorId: number, 
  secretCode: string
): Promise<{success: boolean; message: string}> {
  try {
    const response = await fetchWithAuth("/visitors/unban", {
      method: "PUT",
      body: JSON.stringify({
        visitor_id: visitorId,
        secret_code: secretCode
      })
    });
    
    return { success: true, message: "Visitor unbanned successfully" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to unban visitor" 
    };
  }
}

/**
 * Record an incident for a visitor
 */
export async function reportIncident(
  visitorId: number, 
  incidentDetails: string, 
  secretCode: string
): Promise<{success: boolean; message: string}> {
  try {
    const response = await fetchWithAuth("/visitors/report-incident", {
      method: "POST",
      body: JSON.stringify({
        visitor_id: visitorId,
        incident_details: incidentDetails,
        secret_code: secretCode
      })
    });
    
    return { success: true, message: "Incident reported successfully" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to report incident" 
    };
  }
}

/**
 * Record a visit for a visitor
 */
export async function recordVisit(
  visitorId: number, 
  reason: string, 
  secretCode: string
): Promise<{success: boolean; message: string; visit?: Visit}> {
  try {
    const response = await fetchWithAuth("/visits/visit", {
      method: "POST",
      body: JSON.stringify({
        visitor_id: visitorId,
        reason,
        secret_code: secretCode
      })
    });
    
    return { 
      success: true, 
      message: "Visit recorded successfully",
      visit: response.visit
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to record visit" 
    };
  }
}

/**
 * Mark a visitor as having left
 */
export async function recordLeave(
  visitorId: number, 
  secretCode: string
): Promise<{success: boolean; message: string; visit?: Visit}> {
  try {
    const response = await fetchWithAuth("/visits/leave", {
      method: "PUT",
      body: JSON.stringify({
        visitor_id: visitorId,
        secret_code: secretCode
      })
    });
    
    return { 
      success: true, 
      message: "Visitor leave recorded successfully",
      visit: response.visit
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to record visitor leave" 
    };
  }
}
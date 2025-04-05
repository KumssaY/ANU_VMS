//src/app/actions/admin.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Define types based on your Flask models
export type SecurityPersonnel = {
  id: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  phone_number?: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  approved_visits?: Visit[];
  approved_leaves?: Visit[];
  recorded_incidents?: Incident[];
  issued_bans?: Ban[];
  lifted_bans?: Ban[];
};

export type Visitor = {
  id: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  phone_number?: string;
  role: string;
  created_at: string;
  is_banned: boolean;
  image_path?: string;
  visits?: Visit[];
  bans?: Ban[];
  incidents?: Incident[];
};

export type Visit = {
  id: string|number;
  reason: string;
  visit_time: string;
  leave_time?: string;
  status: string;
  duration?: string;
  approved_by: SecurityPersonnel;
  left_approved_by?: SecurityPersonnel | null;
  visitor: Visitor;
  bans: Ban[];
  incidents: Incident[];
};

export type Incident = {
  id: number;
  description: string;
  recorded_at: string;
  recorded_by: SecurityPersonnel;
  visit: Visit;
  visitor: Visitor;
};

export type Ban = {
  id: number;
  reason: string;
  issued_at: string;
  lifted_at?: string;
  is_active: boolean;
  issued_by: SecurityPersonnel;
  lifted_by?: SecurityPersonnel;
  visitor: Visitor;
  visit: Visit | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
};

// Base URL for API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// Helper function to get the auth token from cookies
const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};

// Utilities for pagination
function appendPaginationParams(url: string, page?: number, perPage?: number): string {
  const params = new URLSearchParams();
  
  if (page !== undefined) {
    params.append('page', page.toString());
  }
  
  if (perPage !== undefined) {
    params.append('per_page', perPage.toString());
  }
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// Base function for API requests
export async function fetchFromAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error JSON, but handle cases where it's not valid JSON
      const errorText = await response.text();
      let errorMessage = `API error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If parsing fails, use the raw text if it exists
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Security Personnel Actions
export async function getAllSecurityPersonnel(
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<SecurityPersonnel>> {
  const url = appendPaginationParams('/api/admin/security-personnel', page, perPage);
  
  const data = await fetchFromAPI<{
    security_personnel: SecurityPersonnel[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.security_personnel,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getSecurityPersonnel(securityUuid: string): Promise<SecurityPersonnel> {
  return fetchFromAPI<SecurityPersonnel>(`/api/admin/security-personnel/${securityUuid}`);
}


// Visitor Actions
export async function getAllVisitors(
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Visitor>> {
  const url = appendPaginationParams('/api/admin/visitors', page, perPage);
  
  const data = await fetchFromAPI<{
    visitors: Visitor[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.visitors,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getVisitor(visitorUuid: string): Promise<Visitor> {
  return fetchFromAPI<Visitor>(`/api/admin/visitors/${visitorUuid}`);
}

export async function getVisitorVisits(
  visitorUuid: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Visit>> {
  const baseUrl = `/api/admin/visitors/${visitorUuid}/visits`;
  const url = appendPaginationParams(baseUrl, page, perPage);
  
  const data = await fetchFromAPI<{
    visits: Visit[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.visits,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getVisitorBans(
  visitorUuid: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Ban>> {
  const baseUrl = `/api/admin/visitors/${visitorUuid}/bans`;
  const url = appendPaginationParams(baseUrl, page, perPage);
  
  const data = await fetchFromAPI<{
    bans: Ban[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.bans,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getVisitorIncidents(
  visitorUuid: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Incident>> {
  const baseUrl = `/api/admin/visitors/${visitorUuid}/incidents`;
  const url = appendPaginationParams(baseUrl, page, perPage);
  
  const data = await fetchFromAPI<{
    incidents: Incident[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.incidents,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

// Record Actions
export async function getAllVisits(
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Visit>> {
  const url = appendPaginationParams('/api/admin/visits', page, perPage);
  
  const data = await fetchFromAPI<{
    visits: Visit[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.visits,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getAllIncidents(
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Incident>> {
  const url = appendPaginationParams('/api/admin/incidents', page, perPage);
  
  const data = await fetchFromAPI<{
    incidents: Incident[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);

  return {
    items: data.incidents,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function getAllBans(
  page: number = 1,
  perPage: number = 10,
  activeOnly: boolean = false
): Promise<PaginatedResponse<Ban>> {
  let url = appendPaginationParams('/api/admin/bans', page, perPage);
  
  // Add active_only parameter if needed
  if (activeOnly) {
    url += url.includes('?') ? '&' : '?';
    url += `active_only=${activeOnly}`;
  }
  
  const data = await fetchFromAPI<{
    bans: Ban[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.bans,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

// Admin Security Personnel Management
export async function createSecurityPersonnel(
  securityData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    national_id: string;
    secret_code: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      '/api/auth/register/security',
      {
        method: 'POST',
        body: JSON.stringify(securityData),
      }
    );
    
    revalidatePath('/admin/security-personnel');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

export async function createAdmin(
  adminData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    national_id: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      '/api/auth/register/admin',
      {
        method: 'POST',
        body: JSON.stringify(adminData),
      }
    );
    
    revalidatePath('/admin/user-management');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Deactivate security personnel
export async function deactivateSecurityPersonnel(
  securityUuid: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      `/api/auth/security/deactivate/${securityUuid}`,
      {
        method: 'PUT',
      }
    );
    
    revalidatePath('/admin/security-personnel');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Update security personnel secret code
export async function updateSecurityCode(
  updateData: {
    email: string;
    new_code: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      '/api/auth/security/update-code',
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
    
    revalidatePath('/admin/security-personnel');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Ban management
export async function issueVisitorBan(
  banData: {
    visitor_id: string;
    reason: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      '/api/admin/bans/issue',
      {
        method: 'POST',
        body: JSON.stringify(banData),
      }
    );
    
    revalidatePath('/admin/bans');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

export async function liftVisitorBan(
  banUuid: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      `/api/admin/bans/${banUuid}/lift`,
      {
        method: 'PUT',
      }
    );
    
    revalidatePath('/admin/bans');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Incident management
export async function recordIncident(
  incidentData: {
    visitor_id: string;
    visit_id: string;
    description: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchFromAPI<{ message: string }>(
      '/api/admin/incidents/record',
      {
        method: 'POST',
        body: JSON.stringify(incidentData),
      }
    );
    
    revalidatePath('/admin/incidents');
    return { success: true, message: response.message };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Dashboard summary
// Dashboard summary interface in admin.ts file
export interface DashboardSummary {
  total_visitors: number;
  active_visits: number;
  visits_today: number;
  incidents_today: number;
  active_bans: number;
  security_personnel_count: number;
  total_visits: number;
  total_incidents: number;
  total_bans: number;
  recent_visits: {
    id: number;
    visitor_id: number;
    visitor_name: string;
    reason: string;
    visit_time: string;
    leave_time: string | null;
  }[];
  recent_incidents: {
    id: number;
    visitor_id: number;
    visit_id: number;
    description: string;
    recorded_by_id: number;
    recorded_at: string;
  }[];
  recent_bans: {
    id: number;
    visitor_id: number;
    reason: string;
    issued_at: string;
    lifted_at: string | null;
    issued_by_id: number;
    lifted_by_id: number | null;
    is_active: boolean;
  }[];
  frequent_visitors: {
    id: number;
    full_name: string;
    visit_count: number;
  }[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    return await fetchFromAPI<DashboardSummary>('/api/admin/dashboard/summary');
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
}

// Search functionality
export async function searchVisitors(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Visitor>> {
  let url = appendPaginationParams('/api/admin/visitors/search', page, perPage);
  url += url.includes('?') ? '&' : '?';
  url += `query=${encodeURIComponent(query)}`;
  
  const data = await fetchFromAPI<{
    visitors: Visitor[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.visitors,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}

export async function searchSecurityPersonnel(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<SecurityPersonnel>> {
  let url = appendPaginationParams('/api/admin/security-personnel/search', page, perPage);
  url += url.includes('?') ? '&' : '?';
  url += `query=${encodeURIComponent(query)}`;
  
  const data = await fetchFromAPI<{
    security_personnel: SecurityPersonnel[];
    total: number;
    pages: number;
    current_page: number;
  }>(url);
  
  return {
    items: data.security_personnel,
    total: data.total,
    pages: data.pages,
    current_page: data.current_page,
  };
}


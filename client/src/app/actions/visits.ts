// src/app/actions/visits.ts

'use server';

import { revalidatePath } from 'next/cache';

// Types
interface VisitData {
  visitor_id: string;  // Changed to string to match the API
  reason: string;
  secret_code: string;
}

interface LeaveData {
  visit_id: number;  // Changed from visitor_id to visit_id
  secret_code: string;
}

// API base URL - can be set from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api';

/**
 * Record a new visit (entry)
 */
export async function recordVisit(formData: FormData) {
  const visitor_id = formData.get('visitor_id') as string;  // Get as string, not Number
  const reason = formData.get('reason') as string;
  const secret_code = formData.get('secret_code') as string;

  const requestData: VisitData = {
    visitor_id,
    reason,
    secret_code,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visits/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to record visit');
    }

    // Revalidate visits list and visitor detail pages
    revalidatePath('/visits');
    revalidatePath(`/visitors/${data.visit.visitor_id}`);  // Use visitor_id from response
    
    return { success: true, visit: data.visit };
  } catch (error) {
    console.error('Error recording visit:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Mark a visitor as leaving
 */
export async function recordLeave(formData: FormData) {
  const visit_id = Number(formData.get('visit_id'));  // Changed from visitor_id to visit_id
  const secret_code = formData.get('secret_code') as string;

  const requestData: LeaveData = {
    visit_id,
    secret_code,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visits/leave`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to record departure');
    }

    // Revalidate visits list and visitor detail pages
    revalidatePath('/visits');
    revalidatePath(`/visitors/${data.visit.visitor_id}`);  // Use visitor_id from response
    
    return { success: true, visit: data.visit };
  } catch (error) {
    console.error('Error recording departure:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get all visits for a specific visitor by UUID
 */
export async function getVisitorVisits(visitorUuid: string, page = 1, perPage = 50, includeRelations = false) {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/visits/visitor/${visitorUuid}/visits?${queryParams}`,
      { cache: 'no-store' } // Skip cache for real-time data
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch visitor visits');
    }

    return { 
      success: true, 
      visits: data.visits,
      visitor: data.visitor,
      pagination: data.pagination,
      visitorUuid: data.visitor_uuid
    };
  } catch (error) {
    console.error('Error fetching visitor visits:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get a specific visit by ID with full details
 */
export async function getVisitDetails(visitId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/visits/visit/${visitId}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch visit details');
    }

    return { success: true, visit: data.visit };
  } catch (error) {
    console.error('Error fetching visit details:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get paginated visits for a visitor using their UUID
 */
export async function getAllVisits(visitorUuid: string, page = 1, perPage = 50) {
  try {
    const queryParams = new URLSearchParams({
      visitor_uuid: visitorUuid,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/visits/visits?${queryParams}`,
      { cache: 'no-store' } // Skip cache for real-time data
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch visits');
    }

    return { 
      success: true, 
      visits: data.visits,
      visitor: data.visitor,
      incidents: data.incidents,
      activeBans: data.active_bans,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching visits:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
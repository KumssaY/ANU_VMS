// src/app/actions/visitor.ts

'use server';

import { revalidatePath } from 'next/cache';

// Types
interface VisitorRegistrationData {
  first_name: string;
  last_name: string;
  phone_number: string;
  national_id: string;
  image_data?: string; // Base64 encoded image
  secret_code: string;
}

interface VisitorIdentificationData {
  national_id?: string;
  image_data?: string; // Base64 encoded image
}

interface BanData {
  visitor_id: string;
  reason: string;
  secret_code: string;
}

interface UnbanData {
  visitor_id: string;
  secret_code: string;
}

interface IncidentData {
  visitor_id: string;
  incident_details: string;
  secret_code: string;
}

// API base URL - can be set from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api';

/**
 * Register a new visitor
 */
export async function registerVisitor(formData: FormData) {
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const phone_number = formData.get('phone_number') as string;
  const national_id = formData.get('national_id') as string;
  const secret_code = formData.get('secret_code') as string;

  // Handle image if present
  let image_data: string | undefined;
  const imageFile = formData.get('image') as File;
  
  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    image_data = `data:${imageFile.type};base64,${base64Image}`;
  }

  const requestData: VisitorRegistrationData = {
    first_name,
    last_name,
    phone_number,
    national_id,
    secret_code,
    ...(image_data && { image_data }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visitors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register visitor');
    }

    // Revalidate visitors list path
    revalidatePath('/visitors');
    return { success: true, data };
  } catch (error) {
    console.error('Error registering visitor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Identify a visitor by national ID or face image
 */
export async function identifyVisitor(formData: FormData) {
  // Get national ID if provided
  const national_id = formData.get('national_id') as string;
  
  // Handle image if provided instead of national ID
  let image_data: string | undefined;
  const imageFile = formData.get('image') as File;
  
  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    image_data = `data:${imageFile.type};base64,${base64Image}`;
  }
  
  // At least one identification method is required
  if (!national_id && !image_data) {
    return { 
      success: false, 
      error: 'Please provide either a national ID or a face image for identification' 
    };
  }

  const requestData: VisitorIdentificationData = {};
  if (national_id) requestData.national_id = national_id;
  if (image_data) requestData.image_data = image_data;

  try {
    const response = await fetch(`${API_BASE_URL}/visitors/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to identify visitor');
    }

    return { success: true, visitor: data.visitor };
  } catch (error) {
    console.error('Error identifying visitor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Ban a visitor
 */
export async function banVisitor(formData: FormData) {
  const visitor_id = String(formData.get('visitor_id')); // Ensure UUID is handled as a string
  const reason = formData.get('reason') as string;
  const secret_code = formData.get('secret_code') as string;

  const requestData: BanData = {
    visitor_id,
    reason,
    secret_code,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visitors/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to ban visitor');
    }

    // Revalidate paths to reflect status change
    revalidatePath('/visitors');
    revalidatePath(`/visitors/${visitor_id}`);

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error banning visitor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}


/**
 * Unban a visitor
 */
export async function unbanVisitor(formData: FormData) {
  const visitor_id = String(formData.get('visitor_id')); // Ensure UUID is handled as a string
  const secret_code = formData.get('secret_code') as string;

  const requestData: UnbanData = {
    visitor_id,
    secret_code,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visitors/unban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unban visitor');
    }

    // Revalidate paths to reflect status change
    revalidatePath('/visitors');
    revalidatePath(`/visitors/${visitor_id}`);

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error unbanning visitor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}


/**
 * Report an incident involving a visitor
 */
export async function reportIncident(formData: FormData) {
  const visitor_id = String(formData.get('visitor_id'));
  const incident_details = formData.get('incident_details') as string;
  const secret_code = formData.get('secret_code') as string;

  const requestData: IncidentData = {
    visitor_id,
    incident_details,
    secret_code,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/visitors/report-incident`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to report incident');
    }

    // Revalidate path for incidents and visitor details
    revalidatePath('/incidents');
    revalidatePath(`/visitors/${visitor_id}`);
    
    return { success: true, incident_id: data.incident_id };
  } catch (error) {
    console.error('Error reporting incident:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get incidents for a visitor by national ID
 */
export async function getVisitorIncidentsByNationalId(nationalId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/incidents/${nationalId}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch incidents');
    }

    return { success: true, incidents: data.incidents };
  } catch (error) {
    console.error('Error fetching visitor incidents:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get specific incident details by incident ID
 */
export async function getIncidentDetails(incidentId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/incident/${incidentId}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch incident details');
    }

    return { success: true, incident: data.incident };
  } catch (error) {
    console.error('Error fetching incident details:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}


/**
 * Get the last visit for a visitor by national ID
 */
export async function getLastVisitByNationalId(nationalId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/last-visit/${nationalId}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch last visit');
    }

    return { success: true, visit: data.visit };
  } catch (error) {
    console.error('Error fetching last visit:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get ban history for a visitor by UUID
 */
export async function getVisitorBanHistory(visitorUuid: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/bans/history/${visitorUuid}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch ban history');
    }

    return { success: true, banHistory: data.ban_history };
  } catch (error) {
    console.error('Error fetching visitor ban history:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get current ban for a visitor by UUID (if any)
 */
export async function getVisitorCurrentBan(visitorUuid: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/bans/current/${visitorUuid}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch current ban');
    }

    return { success: true, currentBan: data.current_ban };
  } catch (error) {
    console.error('Error fetching visitor current ban:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Get details for a specific ban by ID
 */
export async function getBanDetails(banId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/visitors/bans/${banId}`, {
      cache: 'no-store', // Skip cache for real-time data
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch ban details');
    }

    return { success: true, banDetails: data.ban_details };
  } catch (error) {
    console.error('Error fetching ban details:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
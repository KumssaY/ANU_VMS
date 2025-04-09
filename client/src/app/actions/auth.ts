// src/app/actions/auth.ts

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Base URL for API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

// Types for authentication
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  role: "admin" | "security";
}

interface RegisterSecurityRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  national_id: string;
  secret_code?: string;
}

interface RegisterAdminRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  national_id: string;
}

interface UpdateSecretCodeRequest {
  email: string;
  new_code: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
}

/**
 * Login function to authenticate security personnel or admin
 */
export async function login(
  credentials: LoginRequest
): Promise<{ success: boolean; message: string; role?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Login failed" };
    }

    const data = await response.json() as LoginResponse;
    
    // Set authentication cookies
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "strict",
    });
    
    cookieStore.set("user_role", data.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "strict",
    });

    // Store user email in cookie
    cookieStore.set("user_email", credentials.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "strict",
    });

    return { 
      success: true, 
      message: "Login successful", 
      role: data.role 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Register a new admin (admin only)
 */
export async function registerAdmin(
  adminData: RegisterAdminRequest
): Promise<AuthResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to register admin" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Admin registered successfully" };
  } catch (error) {
    console.error("Register admin error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Register a new security personnel (admin only)
 */
export async function registerSecurityPersonnel(
  securityData: RegisterSecurityRequest
): Promise<AuthResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/security`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(securityData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to register security personnel" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Security personnel registered successfully" };
  } catch (error) {
    console.error("Register security personnel error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Update security code for security personnel
 */
export async function updateSecurityCode(
  updateData: UpdateSecretCodeRequest
): Promise<AuthResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/security/update-code`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to update security code" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Security code updated successfully" };
  } catch (error) {
    console.error("Update security code error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Deactivate security personnel (admin only)
 */
export async function deactivateSecurityPersonnel(
  email: string
): Promise<AuthResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/security/deactivate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to deactivate security personnel" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Security personnel deactivated successfully" };
  } catch (error) {
    console.error("Deactivate security personnel error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Activate security personnel (admin only)
 */
export async function activateSecurityPersonnel(
  email: string
): Promise<AuthResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/security/activate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.error || "Failed to activate security personnel" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Security personnel activated successfully" };
  } catch (error) {
    console.error("activate security personnel error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Helper function to get the auth token from cookies
 */
const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

/**
 * Get current user role
 */
export async function getUserRole(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("user_role")?.value || null;
}

/**
 * Logout function to remove auth cookies
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_role");
  redirect("/login");
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Check if user has security personnel role
 */
export async function isSecurity(): Promise<boolean> {
  const role = await getUserRole();
  return role === "security";
}

/**
 * Middleware-like function to ensure user is authenticated
 */
export async function requireAuth(redirectPath: string = "/login"): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect(redirectPath);
  }
}

/**
 * Middleware-like function to ensure user has admin role
 */
export async function requireAdmin(redirectPath: string = "/unauthorized"): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    redirect(redirectPath);
  }
}

/**
 * Middleware-like function to ensure user has security role
 */
export async function requireSecurity(redirectPath: string = "/unauthorized"): Promise<void> {
  const security = await isSecurity();
  if (!security) {
    redirect(redirectPath);
  }
}

/**
 * Get current user's email from cookies
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("user_email")?.value || null;
}
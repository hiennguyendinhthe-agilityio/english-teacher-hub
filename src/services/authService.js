/**
 * authService.js - Bridge between Clerk (auth) and our FastAPI Backend (data).
 *
 * IMPORTANT: Clerk JWTs do NOT contain `email` in the payload by default.
 * All endpoints use `sub` (Clerk User ID) for identity. The `/sync` endpoint
 * accepts email in the request body (from Clerk's useUser() hook) to store on signup.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Sync the Clerk-authenticated user with our PostgreSQL backend.
 *
 * @param {Function} getToken  - Clerk's getToken() function
 * @param {Object}   clerkUser - Clerk's user object from useUser() hook (optional)
 *                               Used to send email in request body on first login.
 */
export async function syncUser(getToken, clerkUser = null) {
  const token = await getToken();
  if (!token) throw new Error("No Clerk token available. Is the user signed in?");

  const baseUrl = API_BASE.replace("/api/v1", "");

  // Extract email from Clerk user object (not from JWT — it's not there by default)
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    null;

  const response = await fetch(`${baseUrl}/api/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Auth sync failed: HTTP ${response.status}`);
  }

  return response.json();
}

export async function getMyProfile(getToken) {
  const token = await getToken();
  const baseUrl = API_BASE.replace("/api/v1", "");

  const response = await fetch(`${baseUrl}/api/users/me/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch profile: HTTP ${response.status}`);

  return response.json();
}

/**
 * Fetch all registered users (Admin only)
 */
export async function getAllUsers(getToken, { skip = 0, limit = 50 } = {}) {
  const token = typeof getToken === "function" ? await getToken() : getToken;
  const baseUrl = API_BASE.replace("/api/v1", "");

  const response = await fetch(`${baseUrl}/api/users?skip=${skip}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errorObj = new Error(err.detail || `Failed to fetch users: HTTP ${response.status}`);
    errorObj.status = response.status;
    throw errorObj;
  }

  return response.json();
}

/**
 * Toggle user active/disable status (Admin only)
 */
export async function toggleUserDisable(getToken, userId) {
  const token = typeof getToken === "function" ? await getToken() : getToken;
  const baseUrl = API_BASE.replace("/api/v1", "");

  const response = await fetch(`${baseUrl}/api/users/${userId}/disable`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errorObj = new Error(err.detail || `Failed to toggle user status: HTTP ${response.status}`);
    errorObj.status = response.status;
    throw errorObj;
  }

  return response.json();
}

/**
 * Change user role (Admin only)
 */
export async function changeUserRole(getToken, userId, role) {
  const token = typeof getToken === "function" ? await getToken() : getToken;
  const baseUrl = API_BASE.replace("/api/v1", "");

  const response = await fetch(`${baseUrl}/api/users/${userId}/role`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: role }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errorObj = new Error(err.detail || `Failed to change user role: HTTP ${response.status}`);
    errorObj.status = response.status;
    throw errorObj;
  }

  return response.json();
}

/**
 * Promote to Admin using secret key
 */
export async function promoteToAdminWithSecret(getToken, secretKey) {
  const token = typeof getToken === "function" ? await getToken() : getToken;
  const baseUrl = API_BASE.replace("/api/v1", "");

  const response = await fetch(`${baseUrl}/api/users/promote-admin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secret_key: secretKey }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errorObj = new Error(err.detail || `Failed to promote to admin: HTTP ${response.status}`);
    errorObj.status = response.status;
    throw errorObj;
  }

  return response.json();
}

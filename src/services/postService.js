/**
 * postService.js - API client for AI Essay and Post Management.
 * Communicates with FastAPI backend (`english_teacher_api`).
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_BASE = rawBase.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

/**
 * Helper to build auth headers with Clerk JWT token.
 */
async function getAuthHeaders(getToken) {
  const token = typeof getToken === 'function' ? await getToken() : getToken;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch list of all available essay categories.
 */
export async function getCategories(getToken) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/categories`, { headers });
  if (!response.ok) {
    const errObj = new Error(`Failed to fetch categories: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }
  return response.json();
}

/**
 * Create a new essay post linked to categories.
 */
export async function createPost(getToken, { title, content, category_ids = [], evaluation = null }) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title, content, category_ids, evaluation }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errObj = new Error(errorData.detail || `Failed to create post: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }
  return response.json();
}

/**
 * Fetch essays written by the current logged-in user (My Essays).
 */
export async function getMyPosts(getToken, { skip = 0, limit = 20 } = {}) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/posts/me?skip=${skip}&limit=${limit}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errObj = new Error(errorData.detail || `Failed to fetch my posts: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }
  return response.json();
}

/**
 * Fetch public feed of all essays.
 */
export async function getPublicPosts(getToken, { skip = 0, limit = 20 } = {}) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/posts?skip=${skip}&limit=${limit}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errObj = new Error(errorData.detail || `Failed to fetch public posts: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }
  return response.json();
}

/**
 * Fetch a single essay by ID (with categories).
 */
export async function getPostDetail(getToken, postId) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errObj = new Error(errorData.detail || `Failed to fetch post detail: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }
  return response.json();
}

/**
 * Delete a post by ID (Author or Admin).
 */
export async function deletePost(getToken, postId) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errObj = new Error(errorData.detail || `Failed to delete post: HTTP ${response.status}`);
    errObj.status = response.status;
    throw errObj;
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json().catch(() => ({ success: true }));
}

/**
 * Create a new category (Admin only).
 */
export async function createCategory(getToken, { name, slug }) {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, slug }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create category: HTTP ${response.status}`);
  }
  return response.json();
}

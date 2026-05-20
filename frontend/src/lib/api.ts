import { Sale } from "@/types/sale";

const BASE_API_URL = "/api";
const BASE_V1_URL = `${BASE_API_URL}/v1`;

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const userId = getCurrentUserId();
  if (userId) headers["X-Current-User-Id"] = userId;
  return headers;
}

// Helper to handle response errors
async function handleResponse(res: Response, defaultError: string) {
  if (!res.ok) {
    let errorMsg = defaultError;
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || defaultError;
    } catch {
      const text = await res.text().catch(() => "");
      errorMsg = text || defaultError;
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function normalizePageResponse<T>(response: any) {
  if (Array.isArray(response)) {
    return {
      content: response as T[],
      totalElements: response.length,
      totalPages: 1,
      number: 0,
      size: response.length,
    };
  }

  const content = Array.isArray(response?.data)
    ? response.data
    : response?.content
      ?? response?.data?.content
      ?? response?.data?.data
      ?? response?.products
      ?? response?.results
      ?? response?.items
      ?? [];

  const totalElements = response?.totalElements
    ?? response?.total_elements
    ?? response?.data?.totalElements
    ?? response?.data?.total_elements
    ?? content.length;

  const totalPages = response?.totalPages
    ?? response?.total_pages
    ?? response?.data?.totalPages
    ?? response?.data?.total_pages
    ?? 0;

  return {
    ...response,
    content,
    totalElements,
    totalPages,
  };
}

// --- Products ---

export async function fetchProducts(
  search?: string, 
  page = 0, 
  size = 5,
  filters?: {
    isActive?: boolean | string;
    stockStatus?: string;
    categoryId?: number;
    brand?: string;
  }
) {
  const url = new URL(`${BASE_V1_URL}/products`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  
  if (filters) {
    if (filters.isActive !== undefined && filters.isActive !== "" && filters.isActive !== "all") {
      url.searchParams.append("isActive", filters.isActive.toString());
    }
    if (filters.stockStatus && filters.stockStatus !== "all") {
      url.searchParams.append("stockStatus", filters.stockStatus);
    }
    if (filters.categoryId !== undefined && filters.categoryId !== null && filters.categoryId > 0) {
      url.searchParams.append("categoryId", filters.categoryId.toString());
    }
    if (filters.brand && filters.brand !== "all") {
      url.searchParams.append("brand", filters.brand);
    }
  }

  const res = await fetch(url.toString());
  const data = await handleResponse(res, "Failed to fetch products");
  return normalizePageResponse<any>(data);
}

export async function fetchProductsByName(name: string) {
  const url = new URL(`${BASE_V1_URL}/products`, window.location.origin);
  if (name) url.searchParams.append("search", name);
  url.searchParams.append("isActive", "true"); // Only fetch active products for sales
  url.searchParams.append("page", "0");
  url.searchParams.append("size", "10");
  
  const res = await fetch(url.toString());
  const data = await handleResponse(res, "Failed to fetch products");

  console.log("PRODUCTS API RESPONSE:", data);

  return normalizePageResponse<any>(data);
}

export async function createProduct(product: any) {
  const res = await fetch(`${BASE_V1_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return handleResponse(res, "Failed to create product");
}

export async function updateProduct(id: number, product: any) {
  const res = await fetch(`${BASE_V1_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return handleResponse(res, "Failed to update product");
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${BASE_V1_URL}/products/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res, "Failed to delete product");
}

export async function toggleProductActive(id: number) {
  const res = await fetch(`${BASE_V1_URL}/products/${id}/toggle-active`, {
    method: "PATCH",
  });
  return handleResponse(res, "Failed to toggle product status");
}

// --- Categories ---

export async function fetchCategories() {
  const res = await fetch(`${BASE_V1_URL}/categories`);
  return handleResponse(res, "Failed to fetch categories");
}

export async function createCategory(category: any) {
  const res = await fetch(`${BASE_V1_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  return handleResponse(res, "Failed to create category");
}

export async function updateCategory(id: number, category: any) {
  const res = await fetch(`${BASE_V1_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  return handleResponse(res, "Failed to update category");
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${BASE_V1_URL}/categories/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res, "Failed to delete category");
}

// --- Sales ---

export async function fetchSales(filters?: { search?: string; status?: string; start?: string; end?: string; page?: number; size?: number }) {
  const url = new URL(`${BASE_V1_URL}/sales`, window.location.origin);

  if (filters) {
    if (filters.search) url.searchParams.append("search", filters.search);
    if (filters.status && filters.status !== "all") url.searchParams.append("status", filters.status);
    if (filters.start) url.searchParams.append("start", filters.start);
    if (filters.end) url.searchParams.append("end", filters.end);
    if (filters.page !== undefined) url.searchParams.append("page", filters.page.toString());
    if (filters.size !== undefined) url.searchParams.append("size", filters.size.toString());
  }

  const res = await fetch(url.toString());
  const data = await handleResponse(res, "Failed to fetch sales");
  return normalizePageResponse<Sale>(data);
}

export async function createSale(data: { items: { productId: number; quantity: number }[] }) {
  const res = await fetch(`${BASE_V1_URL}/sales/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Failed to process sale");
}

export async function deleteSale(id: number) {
  const res = await fetch(`${BASE_V1_URL}/sales/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res, "Failed to delete sale");
}

// --- Stats ---

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE_V1_URL}/products/stats`);
  return handleResponse(res, "Failed to fetch dashboard statistics");
}

export async function fetchSalesDashboardAnalytics() {
  const res = await fetch(`${BASE_V1_URL}/sales/stats/dashboard`);
  return handleResponse(res, "Failed to fetch sales analytics");
}

// --- Users ---

export async function fetchAllUsers() {
  const res = await fetch(`${BASE_API_URL}/auth/users`);
  return handleResponse(res, "Failed to fetch users");
}

export async function deleteUser(id: number) {
  const res = await fetch(`${BASE_API_URL}/auth/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res, "Failed to delete user");
}

export async function updateUserProfile(
  id: number,
  data: { userName?: string; image?: File }
) {
  const formData = new FormData();
  if (data.userName) formData.append("userName", data.userName);
  if (data.image) formData.append("image", data.image);

  const res = await fetch(`${BASE_API_URL}/auth/users/${id}/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res, "Failed to update profile");
}
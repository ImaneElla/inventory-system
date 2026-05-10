const BASE_URL = "http://localhost:8080/api/v1";

export async function fetchProducts(search?: string, page = 0, size = 10) {
  const url = new URL(`${BASE_URL}/products`);
  if (search) url.searchParams.append("search", search);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE_URL}/products/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function createProduct(product: any) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: number, product: any) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function createCategory(category: any) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

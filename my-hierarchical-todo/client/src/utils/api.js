const API_BASE = "http://localhost:5000/api";

export async function fetchLists() {
  const response = await fetch(`${API_BASE}/lists`);
  return response.json();
}

export async function createList(title) {
  const response = await fetch(`${API_BASE}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return response.json();
}

export async function updateList(listId, title) {
  const response = await fetch(`${API_BASE}/lists/${listId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return response.json();
}

export async function deleteList(listId) {
  return await fetch(`${API_BASE}/lists/${listId}`, {
    method: "DELETE",
  });
}

export async function createItem(parentType, parentId, content) {
  const response = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentType, parentId, content }),
  });
  return response.json();
}

export async function updateItem(itemId, content) {
  const response = await fetch(`${API_BASE}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return response.json();
}

export async function deleteItem(itemId) {
  return await fetch(`${API_BASE}/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function moveItem(itemId, targetParentType, targetParentId, targetIndex) {
  const response = await fetch(`${API_BASE}/items/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, targetParentType, targetParentId, targetIndex }),
  });
  return response.json();
}

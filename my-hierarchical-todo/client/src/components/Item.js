import React, { useState } from "react";
import { updateItem, deleteItem, createItem } from "../utils/api";
import "../styles/Item.css";

/**
 * Renders a single item. Can recursively render sub-items.
 * Allows editing and toggling sub-items' visibility.
 */
function Item({ item, parentType, parentId }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const [newSubItemContent, setNewSubItemContent] = useState("");

  async function handleContentBlur() {
    if (content.trim() && content !== item.content) {
      await updateItem(item.id, content);
    }
    setEditing(false);
  }

  async function handleDelete() {
    await deleteItem(item.id);
    // Reload or handle via callback
    window.location.reload();
  }

  async function handleAddSubItem() {
    if (!newSubItemContent.trim()) return;
    await createItem("item", item.id, newSubItemContent);
    setNewSubItemContent("");
    window.location.reload();
  }

  return (
    <div className="item-container">
      <div className="item-header">
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? "Show" : "Hide"} sub-items
        </button>
        {editing ? (
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            autoFocus
          />
        ) : (
          <span onClick={() => setEditing(true)}>{item.content}</span>
        )}
        <button onClick={handleDelete}>X</button>
      </div>

      {!isCollapsed && (
        <div className="sub-item-section">
          {item.subItems && item.subItems.length > 0 && (
            <div className="sub-item-list">
              {item.subItems.map((sub) => (
                <Item
                  key={sub.id}
                  item={sub}
                  parentType="item"
                  parentId={item.id}
                />
              ))}
            </div>
          )}

          {/* If you want to strictly limit depth to 3, 
              you can check how deep we are and hide this input if at depth 3 */}
          {item.subItems?.length < 3 && (
            <div className="new-sub-item-form">
              <input
                type="text"
                value={newSubItemContent}
                placeholder="Add sub-item..."
                onChange={(e) => setNewSubItemContent(e.target.value)}
              />
              <button onClick={handleAddSubItem}>Add Sub-Item</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Item;

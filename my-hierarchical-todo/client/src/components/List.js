import React, { useState } from "react";
import Item from "./Item";
import { updateList, createItem } from "../utils/api";
import "../styles/List.css";

import { Draggable } from "react-beautiful-dnd";

const List = ({ list, onDeleteList }) => {
  const [title, setTitle] = useState(list.title);
  const [editing, setEditing] = useState(false);
  const [newItemContent, setNewItemContent] = useState("");

  async function handleTitleBlur() {
    if (title.trim() && title !== list.title) {
      await updateList(list.id, title);
    }
    setEditing(false);
  }

  async function handleAddItem() {
    if (!newItemContent.trim()) return;
    await createItem("list", list.id, newItemContent);
    setNewItemContent("");
    // Reload the page or use a callback to reload data.
    window.location.reload();
  }

  return (
    <div className="list-container">
      <div className="list-header">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            autoFocus
          />
        ) : (
          <h2 onClick={() => setEditing(true)}>{list.title}</h2>
        )}
        <button onClick={() => onDeleteList(list.id)}>Delete List</button>
      </div>

      <div className="new-item-form">
        <input
          type="text"
          value={newItemContent}
          placeholder="Add new item..."
          onChange={(e) => setNewItemContent(e.target.value)}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>

      {list.items?.map((item, index) => (
        <Draggable draggableId={item.id} index={index} key={item.id}>
          {(provided) => (
            <div
              className="draggable-item-wrapper"
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Item item={item} parentType="list" parentId={list.id} />
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
};

export default List;

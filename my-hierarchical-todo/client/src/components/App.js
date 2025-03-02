import React, { useEffect, useState } from "react";
import { fetchLists, createList, deleteList, moveItem } from "../utils/api";
import List from "./List";

import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "../styles/App.css";

function App() {
  const [lists, setLists] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  // Load lists from server on mount
  useEffect(() => {
    loadLists();
  }, []);

  async function loadLists() {
    const data = await fetchLists();
    setLists(data);
  }

  async function handleCreateList() {
    if (!newListTitle.trim()) return;
    const newList = await createList(newListTitle);
    // Update local state
    setLists((prev) => ({
      ...prev,
      [newList.id]: { ...newList, items: [] },
    }));
    setNewListTitle("");
  }

  async function handleDeleteList(listId) {
    await deleteList(listId);
    setLists((prev) => {
      const newState = { ...prev };
      delete newState[listId];
      return newState;
    });
  }

  // React Beautiful DnD callback
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // source.droppableId => old parent's ID
    // destination.droppableId => new parent's ID
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    const targetIndex = destination.index;

    // Move the item in the backend
    await moveItem(draggableId, "list", destListId, targetIndex);

    // Reload data from the server or update local state
    loadLists();
  };

  return (
    <div className="app-container">
      <h1>Hierarchical ToDo Lists</h1>

      <div className="create-list-form">
        <input
          type="text"
          value={newListTitle}
          placeholder="New List Title"
          onChange={(e) => setNewListTitle(e.target.value)}
        />
        <button onClick={handleCreateList}>Create List</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="lists-container">
          {Object.values(lists).map((list) => (
            <Droppable droppableId={list.id} key={list.id}>
              {(provided) => (
                <div
                  className="single-list-droppable"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <List
                    list={list}
                    onDeleteList={handleDeleteList}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;

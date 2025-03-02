import React from "react";

function SubItem({ subItem }) {
  // In practice, you'd have similar logic to edit, delete, or nest deeper
  return (
    <div>
      <span>{subItem.content}</span>
    </div>
  );
}

export default SubItem;

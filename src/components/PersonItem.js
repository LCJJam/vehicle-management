import React from "react";
import { useDrag } from "react-dnd";
import "./PersonItem.css";

const ItemType = "PERSON";

const PersonItem = ({ name, from, group, movePerson }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { name, from, group },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`person-item ${isDragging ? "dragging" : ""}`}
      style={{ cursor: "grab" }}
    >
      {name}
    </div>
  );
};

export default PersonItem;

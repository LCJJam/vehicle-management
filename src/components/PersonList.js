import React, { memo, useCallback } from "react";
import { useDrag } from "react-dnd";
import "./PersonList.css";

const ItemType = "PERSON";

const PersonList = ({ type, title, people, setPeople }) => {
  // 항목 추가
  const handleAdd = useCallback(
    (e) => {
      if (e.key === "Enter" && e.target.value.trim()) {
        const newPerson = {
          id: `${type}_${Date.now()}`,
          name: e.target.value.trim(),
        };

        if (people.some((person) => person.name === newPerson.name)) {
          console.warn("Duplicate name detected:", newPerson.name);
          return;
        }

        setPeople((prev) => [...prev, newPerson]);
        e.target.value = "";
      }
    },
    [setPeople, people, type]
  );

  return (
    <div className="person-list">
      <h3>{title}</h3>
      <ul className="person-list-items">
        {people.map((person) => (
          <DraggablePerson
            key={person.id}
            person={person}
            from={type}
            setPeople={setPeople}
          />
        ))}
      </ul>
      <input
        type="text"
        placeholder={`Add ${title}`}
        onKeyDown={handleAdd}
        className="add-person-input"
      />
    </div>
  );
};

const DraggablePerson = memo(({ person, from, setPeople }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { name: person.name, from },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleRemove = useCallback(() => {
    setPeople((prev) => prev.filter((p) => p.id !== person.id));
  }, [person.id, setPeople]);

  return (
    <li
      ref={drag}
      className={`draggable-person ${isDragging ? "dragging" : ""}`}
      onClick={handleRemove}
    >
      {person.name}
    </li>
  );
});

export default memo(PersonList);

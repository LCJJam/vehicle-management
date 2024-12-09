import React, { memo, useEffect } from "react";
import { useDrag } from "react-dnd";
import "./PersonList.css";

const PersonList = ({ type, title, people, setPeople, saveData }) => {
  useEffect(() => {
    // 이름순으로 정렬
    const sortedPeople = [...people].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setPeople(sortedPeople);
  }, [people, setPeople]);

  // 항목 추가
  const handleAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newPerson = {
        id: `${type}_${Date.now()}`,
        name: e.target.value.trim(),
      };

      // 중복 확인
      if (people.some((person) => person.name === newPerson.name)) {
        console.warn("Duplicate name detected:", newPerson.name);
        return;
      }

      // 상태 업데이트 및 데이터 저장
      setPeople((prev) => {
        const updated = [...prev, newPerson];
        console.log(updated);
        saveData(updated); // 변경된 데이터를 저장
        return updated;
      });

      e.target.value = ""; // 입력 필드 초기화
    }
  };

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
            saveData={saveData} // DraggablePerson에 저장 함수 전달
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

const DraggablePerson = memo(({ person, from, setPeople, saveData }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PERSON",
    item: { name: person.name, from },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // 항목 제거
  const handleRemove = () => {
    setPeople((prev) => {
      const updated = prev.filter((p) => p.id !== person.id);
      saveData(updated); // 변경된 데이터를 저장
      return updated;
    });
  };

  return (
    <li
      ref={drag}
      className={`draggable-person ${isDragging ? "dragging" : ""}`}
      onClick={handleRemove} // 클릭 시 삭제
    >
      {person.name}
    </li>
  );
});

export default memo(PersonList);

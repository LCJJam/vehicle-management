import React from "react";
import { useDrop } from "react-dnd";
import PersonItem from "./PersonItem"; // Drag 가능한 컴포넌트
import "./VehicleCard.css";

const ItemType = "PERSON";

const VehicleCard = ({
  id,
  title,
  departureTime,
  arrivalTime,
  drivers,
  firstGroup,
  secondGroup,
  movePerson,
  updateTime,
  removePerson, // 삭제 함수 추가
}) => {
  const handleTimeChange = (type, newTime) => {
    updateTime(id, type, newTime);
  };

  const createDropZone = (groupName, people, dropRef) => (
    <div
      className={`drop-zone ${people.length === 0 ? "empty" : "filled"}`}
      ref={dropRef}
    >
      {people.map((person, index) => (
        <div
          key={index}
          className="person-item-container"
          onClick={() => removePerson(id, groupName, person)} // 삭제 이벤트 연결
          style={{ cursor: "pointer" }}
        >
          <PersonItem
            name={person}
            from={id}
            group={groupName}
            movePerson={movePerson}
          />
        </div>
      ))}
    </div>
  );

  const driversDrop = useDrop({
    accept: ItemType,
    drop: (item) => {
      movePerson(item.name, item.from, id, "drivers");
    },
  })[1];

  const firstGroupDrop = useDrop({
    accept: ItemType,
    drop: (item) => {
      movePerson(item.name, item.from, id, "firstGroup");
    },
  })[1];

  const secondGroupDrop = useDrop({
    accept: ItemType,
    drop: (item) => {
      movePerson(item.name, item.from, id, "secondGroup");
    },
  })[1];

  return (
    <div className="vehicle-card">
      <h3 className="vehicle-title">{title}</h3>
      <div className="time-edit">
        <label>
          출발:
          <input
            type="time"
            value={departureTime}
            onChange={(e) => handleTimeChange("departureTime", e.target.value)}
            className="time-input"
          />
        </label>
        <label>
          도착:
          <input
            type="time"
            value={arrivalTime}
            onChange={(e) => handleTimeChange("arrivalTime", e.target.value)}
            className="time-input"
          />
        </label>
      </div>
      <div className="group">
        <h4>운전자</h4>
        {createDropZone("drivers", drivers, driversDrop)}
      </div>
      <div className="group">
        <h4>1차 인원</h4>
        {createDropZone("firstGroup", firstGroup, firstGroupDrop)}
      </div>
      <div className="group">
        <h4>2차 인원</h4>
        {createDropZone("secondGroup", secondGroup, secondGroupDrop)}
      </div>
    </div>
  );
};

export default VehicleCard;

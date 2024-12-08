import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VehicleCard from "../components/VehicleCard";
import PersonList from "../components/PersonList";
import html2canvas from "html2canvas";
import "./MainPage.css";

function MainPage() {
  const captureRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [vehicles, setVehicles] = useState([
    {
      id: "vehicle1",
      title: "1 호차",
      departureTime: "09:00",
      arrivalTime: "10:30",
      drivers: [],
      firstGroup: [],
      secondGroup: [],
    },
    {
      id: "vehicle2",
      title: "2 호차",
      departureTime: "10:45",
      arrivalTime: "12:15",
      drivers: [],
      firstGroup: [],
      secondGroup: [],
    },
    {
      id: "vehicle3",
      title: "3 호차",
      departureTime: "13:00",
      arrivalTime: "14:30",
      drivers: [],
      firstGroup: [],
      secondGroup: [],
    },
  ]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const driversData = JSON.parse(
          await window.electronAPI.readFile("drivers")
        );
        const passengersData = JSON.parse(
          await window.electronAPI.readFile("passengers")
        );
        setDrivers(driversData);
        setPassengers(passengersData);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    loadData();
  }, []);

  // 데이터 저장
  useEffect(() => {
    const saveData = async () => {
      try {
        await window.electronAPI.writeFile(
          "drivers",
          JSON.stringify(drivers, null, 2)
        );
        await window.electronAPI.writeFile(
          "passengers",
          JSON.stringify(passengers, null, 2)
        );
      } catch (err) {
        console.error("Failed to save data:", err);
      }
    };

    saveData();
  }, [drivers, passengers]);

  const updateTime = (id, type, newTime) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, [type]: newTime } : vehicle
      )
    );
  };

  const movePerson = (name, fromGroup, toVehicleId, toGroup) => {
    console.log("movePerson called with:", {
      name,
      fromGroup,
      toVehicleId,
      toGroup,
    });

    // 데이터가 이동하지 않을 때
    if (!name || (!toGroup && !toVehicleId)) {
      console.log("No movement detected:", name, fromGroup);
      return;
    }

    // fromGroup이 drivers 또는 passengers일 경우 처리
    if (fromGroup === "drivers" || fromGroup === "passengers") {
      const setSource = fromGroup === "drivers" ? setDrivers : setPassengers;

      // 데이터를 삭제하지 않고 그대로 유지
      console.log(`Keeping ${name} in ${fromGroup}`);
    } else {
      // 차량 그룹 내에서 이동 시 데이터 복사 (삭제 X)
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle[fromGroup]?.includes(name)
            ? {
                ...vehicle,
                [fromGroup]: [...vehicle[fromGroup]],
              }
            : vehicle
        )
      );
    }

    // toVehicleId와 toGroup으로 복사
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === toVehicleId) {
          if (!Array.isArray(vehicle[toGroup])) {
            console.error(`Invalid toGroup: ${toGroup}`, vehicle);
            return vehicle;
          }
          return { ...vehicle, [toGroup]: [...vehicle[toGroup], name] };
        }
        return vehicle;
      })
    );
  };

  const removePerson = (vehicleId, groupName, personName) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              [groupName]: vehicle[groupName].filter(
                (name) => name !== personName
              ),
            }
          : vehicle
      )
    );
  };

  const saveAsImage = () => {
    if (!captureRef.current) {
      alert("캡처할 영역이 없습니다.");
      return;
    }
    html2canvas(captureRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `배차기록.png`;
      link.click();
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="main-page">
        <header className="header">
          <h1>배차 관리 시스템</h1>
        </header>
        <div className="content">
          <div ref={captureRef} className="capture-area">
            <div className="vehicle-container">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  {...vehicle}
                  movePerson={movePerson}
                  updateTime={updateTime}
                  removePerson={removePerson}
                />
              ))}
            </div>
          </div>
          <aside className="person-lists">
            <PersonList
              type="drivers"
              title="Drivers"
              people={drivers}
              setPeople={setDrivers}
            />
            <PersonList
              type="passengers"
              title="Passengers"
              people={passengers}
              setPeople={setPassengers}
            />
          </aside>
        </div>
        <footer className="footer">
          <button onClick={saveAsImage}>이미지로 저장</button>
        </footer>
      </div>
    </DndProvider>
  );
}

export default MainPage;

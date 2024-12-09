import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VehicleCard from "../components/VehicleCard";
import PersonList from "../components/PersonList";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
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
    {
      id: "vehicle4",
      title: "4 호차",
      departureTime: "13:00",
      arrivalTime: "14:30",
      drivers: [],
      firstGroup: [],
      secondGroup: [],
    },
  ]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  // 데이터 로드
  const loadData = async () => {
    try {
      const driversData = JSON.parse(
        await window.electronAPI.readFile("drivers.json")
      );
      const passengersData = JSON.parse(
        await window.electronAPI.readFile("passengers.json")
      );
      const savedRecordsData = JSON.parse(
        await window.electronAPI.readFile("savedRecords.json")
      );

      setDrivers(driversData || []);
      setPassengers(passengersData || []);
      setSavedRecords(savedRecordsData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    loadData();
  }, []);

  const savePassenger = async (passengers) => {
    try {
      // Passengers 저장
      if (Array.isArray(passengers)) {
        const uniquePassengers = passengers.filter(
          (passenger, index, self) =>
            index === self.findIndex((p) => p.id === passenger.id)
        );
        saveToFile("passengers.json", uniquePassengers);
        console.log("Passengers saved successfully.");
      }
    } catch (err) {
      console.error("Failed to save Passenger:", err);
    }
  };

  const saveDriver = async (drivers) => {
    try {
      // Drivers 저장
      if (Array.isArray(drivers)) {
        const uniqueDrivers = drivers.filter(
          (driver, index, self) =>
            index === self.findIndex((d) => d.id === driver.id)
        );
        saveToFile("drivers.json", uniqueDrivers);
        console.log("Drivers saved successfully.");
      }
    } catch (err) {
      console.error("Failed to save Driver:", err);
    }
  };

  const saveRecord = async (title) => {
    const newRecord = {
      title,
      date: new Date().toISOString().split("T")[0],
      vehicles: [...vehicles],
    };
    const updatedRecords = [...savedRecords, newRecord];

    try {
      // SavedRecords 저장
      if (Array.isArray(updatedRecords)) {
        const uniqueRecords = updatedRecords.filter(
          (record, index, self) =>
            index === self.findIndex((r) => r.title === record.title)
        );
        saveToFile("savedRecords.json", uniqueRecords);
        console.log("SavedRecords saved successfully.");
      }

      setSavedRecords(updatedRecords);
    } catch (err) {
      console.error("Failed to save Records:", err);
    }

    alert("배차 기록이 저장되었습니다!");
  };

  const saveToFile = async (fileName, data) => {
    try {
      await window.electronAPI.writeFile(
        fileName,
        JSON.stringify(data, null, 2)
      );
      console.log(`${fileName} saved successfully.`);
    } catch (err) {
      console.error(`Failed to save ${fileName}:`, err);
    }
  };

  const toggleNavbar = () => {
    setIsNavbarVisible((prev) => !prev);
  };

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

    if (!name || (!toGroup && !toVehicleId)) {
      console.log("No movement detected:", name, fromGroup);
      return;
    }

    if (fromGroup === "drivers" || fromGroup === "passengers") {
      const setSource = fromGroup === "drivers" ? setDrivers : setPassengers;
      setSource((prev) => prev.filter((person) => person !== name));
    } else {
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle[fromGroup]?.includes(name)
            ? {
                ...vehicle,
                [fromGroup]: vehicle[fromGroup].filter((p) => p !== name),
              }
            : vehicle
        )
      );
    }

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

  // Remove Person in Vehicles's any Group
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

  const loadRecord = (recordIndex) => {
    const record = savedRecords[recordIndex];
    if (record) {
      setVehicles(record.vehicles);
      alert(`"${record.title}" 배차 기록이 불러와졌습니다.`);
    }
  };

  const removeRecord = (recordIndex) => {
    const updatedRecords = savedRecords.filter(
      (_, index) => index !== recordIndex
    );
    try {
      // SavedRecords 저장
      saveToFile("savedRecords.json", updatedRecords);
      console.log("SavedRecords saved successfully.");

      setSavedRecords(updatedRecords);
    } catch (err) {
      console.error("Failed to save Records:", err);
    }

    alert("배차 기록이 삭제되었습니다!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="main-page">
        <header className="header">
          <h1>배차 관리 시스템</h1>
          <button
            className="toggle-navbar-btn"
            onClick={toggleNavbar}
            style={{
              position: "fixed",
              top: "10px",
              left: "10px",
              zIndex: 1100,
            }}
          >
            {isNavbarVisible ? "닫기" : "메뉴"}
          </button>
        </header>
        <Navbar
          isVisible={isNavbarVisible}
          setIsNavbarVisible={setIsNavbarVisible}
          savedRecords={savedRecords}
          saveRecord={saveRecord}
          loadRecord={loadRecord}
          removeRecord={removeRecord}
        />
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
              saveData={saveDriver}
            />
            <PersonList
              type="passengers"
              title="Passengers"
              people={passengers}
              setPeople={setPassengers}
              saveData={savePassenger}
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

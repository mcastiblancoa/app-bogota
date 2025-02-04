import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaPlus } from "react-icons/fa";
import "../App.css";
import { db, collection, addDoc, getDocs, deleteDoc, doc } from "../firebase";

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [incidentType, setIncidentType] = useState("Robo");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [error, setError] = useState(""); // Estado para manejar el mensaje de error

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Error al obtener la ubicación:", err);
          setUserPosition([4.7109886, -74.072092]);
        }
      );
    } else {
      console.error("Geolocalización no soportada por el navegador.");
      setUserPosition([4.7109886, -74.072092]);
    }
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "incidents"));
        const now = new Date();
        const validMarkers = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const timestamp = data.timestamp?.toDate();
          const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

          if (hoursDiff <= 8) {
            validMarkers.push({ id: docSnap.id, ...data });
          } else {
            await deleteDoc(doc(db, "incidents", docSnap.id)); // Elimina incidentes viejos
          }
        }

        setMarkers(validMarkers);
      } catch (error) {
        console.error("Error al obtener los incidentes:", error);
      }
    };

    fetchMarkers();
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setSelectedPosition(e.latlng);
        setShowForm(true);
      },
    });
    return null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validación: Verifica si el campo de descripción está vacío
    if (incidentDescription.trim() === "") {
      setError("La descripción no puede estar vacía."); // Mensaje de error
      return; // Detiene la ejecución si el campo está vacío
    }

    if (!selectedPosition) {
      alert("Selecciona una ubicación en el mapa.");
      return;
    }

    const newMarker = {
      position: {
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
      },
      type: incidentType,
      description: incidentDescription,
      timestamp: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, "incidents"), newMarker);
      setMarkers([...markers, { id: docRef.id, ...newMarker }]);
      setShowForm(false);
      setIncidentType("Robo");
      setIncidentDescription("");
      setSelectedPosition(null);
      setError(""); // Limpia el mensaje de error
    } catch (error) {
      console.error("Error al guardar el incidente:", error);
    }
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case "Robo":
        return "red";
      case "Accidente":
        return "yellow";
      default:
        return "blue";
    }
  };

  if (!userPosition) {
    return <div>Cargando mapa...</div>;
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer center={userPosition} zoom={20} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker) => {
          const icon = L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${getMarkerColor(marker.type)}.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
          return (
            <Marker key={marker.id} position={marker.position} icon={icon}>
              <Popup>
                <strong>Tipo:</strong> {marker.type} <br />
                <strong>Descripción:</strong> {marker.description}
              </Popup>
            </Marker>
          );
        })}
        <MapClickHandler />
      </MapContainer>

      <button onClick={() => setShowForm(!showForm)} className="add-button">
        <FaPlus />
      </button>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label className="incidente-tittle"><strong>Tipo de incidente</strong></label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px",
                  fontFamily: "Montserrat",
                }}
              >
                <option value="Robo">Robo</option>
                <option value="Accidente">Accidente</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label className="incidente-tittle"><strong>Descripción</strong></label>
              <textarea
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                style={{ width: "100%", padding: "5px", fontFamily: "Montserrat" }}
                rows="3"
              />
              {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>} {/* Mensaje de error */}
            </div>
            <button
              type="submit"
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                fontFamily: "Montserrat",
              }}
            >
              Agregar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
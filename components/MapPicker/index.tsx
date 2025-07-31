import React, { useState, useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  useMap,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MyMapProps {
  position: [number, number];
  zoom: number;
  onLocationSelect: (lat: number, lng: number) => void;
  editable?: boolean;
}

const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
};

const LocationMarker = ({
  onLocationSelect,
  setMarkerPosition,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  setMarkerPosition: (pos: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
      setMarkerPosition([lat, lng]);
    },
  });
  return null;
};

const MyMap: React.FC<MyMapProps> = ({
  position,
  zoom,
  onLocationSelect,
  editable = false,
}) => {
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(position);

  // Update marker if position prop changes
  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return (
    <div className="z-0 h-[400px] w-full">
      <MapContainer
        center={markerPosition}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView coords={markerPosition} />
        <Marker position={markerPosition}>
          <Popup>Selected location</Popup>
        </Marker>

        {editable && (
          <LocationMarker
            onLocationSelect={onLocationSelect}
            setMarkerPosition={setMarkerPosition}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MyMap;

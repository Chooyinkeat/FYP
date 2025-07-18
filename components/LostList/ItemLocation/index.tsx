"use client";
import { useState, useEffect } from "react";
import MyMap from "@/components/MapWrapper";

interface ItemLocationProps {
  location: string;
}

const geocodeAddress = async (
  address: string,
): Promise<[number, number] | null> => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return [lat, lon];
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return null;
};
const ItemLocation = ({ location }: ItemLocationProps) => {
  const [mapPosition, setMapPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    geocodeAddress(location).then((coords) => {
      if (coords) {
        setMapPosition(coords);
      } else {
      }
    });
  }, []);

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {mapPosition[0] !== 0 && mapPosition[1] !== 0 && (
          <MyMap
            position={mapPosition}
            zoom={20}
            onLocationSelect={(lat, lng) => {
              setMapPosition([lat, lng]);
            }}
            editable={false}
          />
        )}
      </div>
    </>
  );
};

export default ItemLocation;

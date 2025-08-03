"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaflet map component with SSR disabled
const MyMap = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <p>Loading map...</p>, // optional loading placeholder
});

export default MyMap;

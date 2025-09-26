"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Import CSS
import "./mapview.css";

// Create a client-side only Map component
const Map = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading map...</div>
});

// Define LatLngExpression type
type LatLngExpression = [number, number];

const JAIPUR: [number, number] = [26.9124, 75.7873];

export type MapMarker = {
  id: string | number;
  position: [number, number];
  title?: string;
  description?: string;
  status?: string;
  address?: string;
  images?: string[]; // optional thumbnails to preview in popup
};

interface MapViewProps {
  center?: [number, number];
  allowDropPin?: boolean;
  onPick?: (data: { lat: number; lng: number; address?: string }) => void;
  markers?: MapMarker[];
  enableReverseGeocode?: boolean;
  className?: string;
  heightClassName?: string; // e.g., "h-[400px] md:h-[600px]"
  selectedPin?: [number, number]; // externally-controlled pin
}

// ClickHandler moved to MapClient.tsx

export const MapView: React.FC<MapViewProps> = ({
  center,
  allowDropPin = false,
  onPick,
  markers = [],
  enableReverseGeocode = false,
  className = "rounded-xl shadow-sm overflow-hidden border",
  heightClassName = "h-[400px] md:h-[600px]",
  selectedPin,
}) => {
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center || JAIPUR);
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const [pickedAddress, setPickedAddress] = useState<string | undefined>(undefined);

  // Geolocate user
  useEffect(() => {
    if (center) return; // external center provided
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentCenter(c);
      },
      () => {
        setCurrentCenter(JAIPUR);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [center]);

  const handlePick = useCallback(
    async (lat: number, lng: number) => {
      setPicked([lat, lng]);
      let address: string | undefined = undefined;
      if (enableReverseGeocode) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          address = data?.display_name;
          setPickedAddress(address);
        } catch {
          // ignore network errors
        }
      }
      onPick?.({ lat, lng, address });
    },
    [onPick, enableReverseGeocode]
  );

  const hasMarkers = markers && markers.length > 0;
  const mapCenter = useMemo(() => {
    if (hasMarkers) return markers[0].position;
    if (selectedPin) return selectedPin;
    if (picked) return picked;
    return currentCenter;
  }, [hasMarkers, markers, picked, currentCenter, selectedPin]);

  return (
    <div className={className}>
      <Map 
        center={mapCenter}
        allowDropPin={allowDropPin}
        onPick={handlePick}
        markers={markers}
        enableReverseGeocode={enableReverseGeocode}
        heightClassName={heightClassName}
        selectedPin={selectedPin || picked}
        pickedAddress={pickedAddress}
      />
    </div>
  );
};

export default MapView;
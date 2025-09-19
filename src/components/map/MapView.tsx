"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapview.css";

// Fix default marker icons path in Next.js bundling
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Merge icon paths once
L.Icon.Default.mergeOptions({
  iconRetinaUrl: (marker2x as unknown as string),
  iconUrl: (marker1x as unknown as string),
  shadowUrl: (markerShadow as unknown as string),
});

const JAIPUR: [number, number] = [26.9124, 75.7873];

export type MapMarker = {
  id: string | number;
  position: [number, number];
  title?: string;
  description?: string;
  status?: string;
  address?: string;
};

interface MapViewProps {
  center?: [number, number];
  allowDropPin?: boolean;
  onPick?: (data: { lat: number; lng: number; address?: string }) => void;
  markers?: MapMarker[];
  enableReverseGeocode?: boolean;
  className?: string;
  heightClassName?: string; // e.g., "h-[400px] md:h-[600px]"
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  allowDropPin = false,
  onPick,
  markers = [],
  enableReverseGeocode = false,
  className = "rounded-xl shadow-sm overflow-hidden border",
  heightClassName = "h-[400px] md:h-[600px]",
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
  const mapCenter: LatLngExpression = useMemo(() => {
    if (hasMarkers) return markers[0].position;
    if (picked) return picked;
    return currentCenter;
  }, [hasMarkers, markers, picked, currentCenter]);

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className={`w-full ${heightClassName}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {allowDropPin && <ClickHandler onClick={handlePick} />}

        {picked && (
          <Marker position={picked}>
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">Selected Location</div>
                <div className="text-xs text-muted-foreground">{picked[0].toFixed(6)}, {picked[1].toFixed(6)}</div>
                {pickedAddress && <div className="text-xs">{pickedAddress}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        {markers.map((m) => (
          <Marker key={m.id} position={m.position}>
            <Popup>
              <div className="space-y-1">
                {m.title && <div className="font-medium">{m.title}</div>}
                {m.description && <div className="text-xs">{m.description}</div>}
                <div className="text-xs text-muted-foreground">
                  {m.position[0].toFixed(6)}, {m.position[1].toFixed(6)}
                </div>
                {m.address && <div className="text-xs">{m.address}</div>}
                {m.status && (
                  <div className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {m.status}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
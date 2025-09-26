"use client";
import React, { useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Initialize Leaflet
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const JAIPUR: [number, number] = [26.9124, 75.7873];

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapClientProps {
  center?: [number, number];
  allowDropPin?: boolean;
  onPick?: (data: { lat: number; lng: number; address?: string }) => void;
  markers?: any[];
  enableReverseGeocode?: boolean;
  className?: string;
  heightClassName?: string;
  selectedPin?: [number, number];
  pickedAddress?: string;
}

const MapClient: React.FC<MapClientProps> = ({
  center,
  allowDropPin = false,
  onPick,
  markers = [],
  enableReverseGeocode = false,
  className = "rounded-xl shadow-sm overflow-hidden border",
  heightClassName = "h-[400px] md:h-[600px]",
  selectedPin,
  pickedAddress: externalPickedAddress,
}) => {
  const [currentCenter, setCurrentCenter] = React.useState<[number, number]>(center || JAIPUR);
  const [picked, setPicked] = React.useState<[number, number] | null>(null);
  const [pickedAddress, setPickedAddress] = React.useState<string | undefined>(externalPickedAddress);

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
        } catch (error) {
          console.error("Error in reverse geocoding:", error);
          // ignore network errors
        }
      }
      if (onPick) {
        onPick({ lat, lng, address });
      }
    },
    [onPick, enableReverseGeocode]
  );

  const hasMarkers = markers && markers.length > 0;
  const mapCenter = React.useMemo(() => {
    if (hasMarkers) return markers[0].position;
    if (selectedPin) return selectedPin;
    if (picked) return picked;
    return currentCenter;
  }, [hasMarkers, markers, picked, currentCenter, selectedPin]);

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

        {(selectedPin || picked) && (
          <Marker position={(selectedPin || picked)!}>
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">Selected Location</div>
                <div className="text-xs text-muted-foreground">{(selectedPin || picked)![0].toFixed(6)}, {(selectedPin || picked)![1].toFixed(6)}</div>
                {pickedAddress && <div className="text-xs">{pickedAddress}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        {markers.map((m) => (
          <Marker key={m.id} position={m.position}>
            <Popup>
              <div className="space-y-2">
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
                {m.images && m.images.length > 0 && (
                  <div className="mt-1 grid grid-cols-3 gap-1">
                    {m.images.slice(0, 6).map((src, idx) => (
                      <a key={idx} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="report image" className="h-12 w-full rounded object-cover" />
                      </a>
                    ))}
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

export default MapClient;
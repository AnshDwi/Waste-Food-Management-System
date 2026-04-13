import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

type Coordinates = {
  lat: number;
  lng: number;
};

const selectedIcon = L.divIcon({
  className: 'leaflet-div-icon-reset',
  html: '<div class="leaflet-pin leaflet-pin-selected"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const ClickCapture = ({ onPick }: { onPick: (next: Coordinates) => void }) => {
  useMapEvents({
    click(event) {
      onPick({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6))
      });
    }
  });

  return null;
};

export const LocationPickerMap = ({
  value,
  onChange
}: {
  value: Coordinates;
  onChange: (next: Coordinates) => void;
}) => {
  const center = useMemo<[number, number]>(() => [value.lat, value.lng], [value.lat, value.lng]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-sm dark:border-white/10">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-64 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={onChange} />
        <Marker position={center} icon={selectedIcon}>
          <Popup autoClose={false} closeButton={false} closeOnClick={false}>
            <span className="text-xs font-semibold">Selected Location</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

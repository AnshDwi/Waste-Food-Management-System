import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

type MapItem = {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  title?: string;
  quantity?: number;
  capacity?: number;
  status?: string;
  vehicleType?: string;
};

type DeliveryItem = {
  id: string;
  status: string;
  route: {
    points?: Array<{ lat: number; lng: number }>;
    progressPercent?: number;
    etaMinutes?: number;
    distanceKm?: number;
  };
  donation?: { title?: string } | null;
  ngo?: { name?: string } | null;
  driver?: { name?: string } | null;
  donorLocation: { lat: number; lng: number };
  ngoLocation: { lat: number; lng: number };
};

const donorIcon = L.divIcon({
  className: 'leaflet-div-icon-reset',
  html: '<div class="leaflet-pin leaflet-pin-donor"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const ngoIcon = L.divIcon({
  className: 'leaflet-div-icon-reset',
  html: '<div class="leaflet-pin leaflet-pin-ngo"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const driverIcon = L.divIcon({
  className: 'leaflet-div-icon-reset',
  html: '<div class="leaflet-driver-marker"><span>D</span></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const FollowDriver = ({
  enabled,
  location
}: {
  enabled: boolean;
  location: { lat: number; lng: number } | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !location) {
      return;
    }

    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 13), {
      animate: true,
      duration: 0.8
    });
  }, [enabled, location, map]);

  return null;
};

export const OperationsMap = ({
  donors,
  ngos,
  drivers,
  deliveries
}: {
  donors: MapItem[];
  ngos: MapItem[];
  drivers: MapItem[];
  deliveries: DeliveryItem[];
}) => {
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [followDriver, setFollowDriver] = useState(true);
  const [animatedDriverPosition, setAnimatedDriverPosition] = useState<{ lat: number; lng: number } | null>(null);

  const leadDelivery = deliveries.find((delivery) => delivery.status !== 'DELIVERED') ?? deliveries[0] ?? null;
  const leadDriver = leadDelivery
    ? drivers.find((driver) => driver.name === leadDelivery.driver?.name) ?? drivers[0] ?? null
    : drivers[0] ?? null;
  const activeDriverNames = drivers.slice(0, 4).map((driver) => driver.name);

  const routePositions = useMemo<[number, number][]>(
    () =>
      (leadDelivery?.route.points?.length ? leadDelivery.route.points : leadDelivery ? [leadDelivery.donorLocation, leadDelivery.ngoLocation] : []).map((point) => [point.lat, point.lng]),
    [leadDelivery]
  );

  useEffect(() => {
    if (!leadDriver?.location) {
      setAnimatedDriverPosition(null);
      return;
    }

    setAnimatedDriverPosition((current) => current ?? leadDriver.location);
  }, [leadDriver?.location]);

  useEffect(() => {
    if (!leadDriver?.location || !animatedDriverPosition) {
      return;
    }

    let frame = 0;
    const start = { ...animatedDriverPosition };
    const target = { ...leadDriver.location };
    const totalFrames = 24;

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setAnimatedDriverPosition({
        lat: Number((start.lat + (target.lat - start.lat) * progress).toFixed(6)),
        lng: Number((start.lng + (target.lng - start.lng) * progress).toFixed(6))
      });

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    const animation = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animation);
  }, [leadDriver?.location, animatedDriverPosition]);

  const routeProgress = leadDelivery?.route.progressPercent ?? 0;
  const etaMinutes = leadDelivery?.route.etaMinutes ?? 0;
  const distanceRemainingKm = leadDelivery?.route.distanceKm ?? 0;
  const mapCenter: [number, number] = animatedDriverPosition
    ? [animatedDriverPosition.lat, animatedDriverPosition.lng]
    : leadDelivery
      ? [leadDelivery.donorLocation.lat, leadDelivery.donorLocation.lng]
      : [28.58, 77.25];

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 dark:border-white/10">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-[560px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FollowDriver enabled={followDriver} location={animatedDriverPosition} />

        {routePositions.length > 1 ? (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#14b8a6', weight: 5, opacity: 0.85 }}
          />
        ) : null}

        {donors.map((donor) => (
          <Marker key={donor.id} position={[donor.location.lat, donor.location.lng]} icon={donorIcon} eventHandlers={{ click: () => setSelected(donor) }} />
        ))}

        {ngos.map((ngo) => (
          <Marker key={ngo.id} position={[ngo.location.lat, ngo.location.lng]} icon={ngoIcon} eventHandlers={{ click: () => setSelected(ngo) }} />
        ))}

        {drivers.map((driver) => {
          const position = leadDriver?.id === driver.id && animatedDriverPosition
            ? [animatedDriverPosition.lat, animatedDriverPosition.lng] as [number, number]
            : [driver.location.lat, driver.location.lng] as [number, number];

          return (
            <Marker key={driver.id} position={position} icon={driverIcon} eventHandlers={{ click: () => setSelected(driver) }} />
          );
        })}

        {selected ? (
          <Popup position={[selected.location.lat, selected.location.lng]} eventHandlers={{ remove: () => setSelected(null) }}>
            <div className="text-sm text-slate-900">
              <p className="font-semibold">{selected.name}</p>
              {selected.vehicleType ? <p>{selected.vehicleType}</p> : null}
              {selected.title ? <p>{selected.title}</p> : null}
              {selected.quantity ? <p>{selected.quantity} portions</p> : null}
              {selected.capacity ? <p>Capacity: {selected.capacity}</p> : null}
              {selected.status ? <p>Status: {selected.status}</p> : null}
            </div>
          </Popup>
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute left-5 top-5 flex flex-wrap gap-3">
        <div className="pointer-events-auto soft-chip rounded-[24px] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg dark:text-white">
          Route progress {routeProgress}%
        </div>
        <div className="pointer-events-auto soft-chip rounded-[24px] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg dark:text-white">
          ETA {etaMinutes} min
        </div>
        {activeDriverNames.length > 0 ? (
          <div className="pointer-events-auto soft-chip flex items-center gap-2 rounded-[24px] px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg dark:text-white">
            <div className="flex -space-x-2">
              {activeDriverNames.map((name) => (
                <div key={name} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs font-bold text-white">
                  {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
              ))}
            </div>
            <span>{drivers.length} active driver{drivers.length > 1 ? 's' : ''}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setFollowDriver((current) => !current)}
        className="absolute right-5 top-5 soft-chip rounded-[24px] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg dark:text-white"
      >
        Follow driver {followDriver ? 'ON' : 'OFF'}
      </button>

      {leadDelivery && leadDriver ? (
        <div className="absolute inset-x-5 bottom-5 glass-panel-strong rounded-[28px] p-4 shadow-2xl md:hidden">
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">Driver live run</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{leadDriver.name}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {leadDelivery.donation?.title ?? 'Donation'} to {leadDelivery.ngo?.name ?? 'NGO'} | {leadDelivery.status}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">ETA {etaMinutes} min</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">Progress {routeProgress}%</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">Remaining {distanceRemainingKm} km</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">Status {leadDelivery.status}</div>
            </div>
          </div>
        </div>
      ) : null}

      {leadDelivery && leadDriver ? (
        <div className="absolute inset-x-5 bottom-5 hidden glass-panel-strong rounded-[28px] p-4 shadow-2xl md:block">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">Driver live run</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-50">{leadDriver.name}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {leadDelivery.donation?.title ?? 'Donation'} to {leadDelivery.ngo?.name ?? 'NGO'} | {leadDelivery.status}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm md:min-w-[320px]">
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">ETA {etaMinutes} min</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">Progress {routeProgress}%</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">Remaining {distanceRemainingKm} km</div>
              <div className="soft-chip rounded-2xl px-3 py-2 text-slate-900 dark:text-white">
                Coords {(animatedDriverPosition?.lat ?? leadDriver.location.lat).toFixed(4)}, {(animatedDriverPosition?.lng ?? leadDriver.location.lng).toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

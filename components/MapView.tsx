import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, CircleMarker, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Navigation } from 'lucide-react';
import { Itinerary, Activity } from '../types';
import { liveMapService, LatLng } from '../services/liveMapService';
import { useLiveTripMap, dayColor, LiveTripMap } from '../services/useLiveTripMap';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  itinerary: Itinerary;
  selectedDay?: number;
  onSelectActivity?: (activity: Activity) => void;
  heightClass?: string;
  showRoute?: boolean;
  /** Live map data from a parent that also needs it; fetched here when omitted. */
  liveMap?: LiveTripMap;
}

/** Numbered pin in the colour of its day. */
function stopIcon(order: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);color:#0b0e14;font:800 12px/1 system-ui,sans-serif;">${order}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

/** Keeps every given point in view; falls back to a city-level view of the centre. */
export function FitBounds({ points, fallback }: { points: LatLng[]; fallback: LatLng }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    const fit = () => {
      if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 15, animate: false });
      else map.setView(points[0] ?? fallback, 13, { animate: false });
    };
    fit();

    // Leaflet measures its container once, at creation. When the box gets its
    // real size later (tab switch, grid layout, entry animation) the map must
    // re-measure, or tiles only fill a corner and the pins sit off-centre.
    const container = map.getContainer();
    let lastSize = '';
    const observer = new ResizeObserver(() => {
      const size = `${container.clientWidth}x${container.clientHeight}`;
      if (size === lastSize || container.clientWidth === 0) return;
      lastSize = size;
      map.invalidateSize({ animate: false });
      fit();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [key, map]);
  return null;
}

/** "Locate me" button: follows the device's live GPS position on the map. */
function LiveLocation() {
  const map = useMap();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [tracking, setTracking] = useState(false);
  const [fix, setFix] = useState<{ position: LatLng; accuracy: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (buttonRef.current) L.DomEvent.disableClickPropagation(buttonRef.current);
  }, []);

  useEffect(() => {
    if (!tracking) { setFix(null); return; }
    if (!('geolocation' in navigator)) {
      setError('Location is not available in this browser.');
      setTracking(false);
      return;
    }

    let first = true;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const position: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setFix({ position, accuracy: pos.coords.accuracy });
        setError(null);
        if (first) { map.flyTo(position, 15); first = false; }
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? 'Location permission was denied.' : 'Could not get your location.');
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking, map]);

  return (
    <>
      <div ref={buttonRef} className="absolute bottom-5 right-3 z-[1000] flex flex-col items-end gap-2">
        {error && (
          <span className="px-3 py-1.5 rounded-xl bg-space-card border border-space-border text-[11px] font-bold text-typo-secondary shadow-lg">
            {error}
          </span>
        )}
        <button
          onClick={() => setTracking((t) => !t)}
          title={tracking ? 'Stop following my location' : 'Show my live location'}
          className={`w-10 h-10 rounded-xl border shadow-lg flex items-center justify-center transition-colors ${
            tracking
              ? 'bg-brand-primary text-space-main border-transparent'
              : 'bg-space-card text-typo-primary border-space-border hover:text-brand-primary'
          }`}
        >
          <LocateFixed size={18} className={tracking && !fix ? 'animate-pulse' : ''} />
        </button>
      </div>

      {fix && (
        <>
          <Circle
            {...({ center: fix.position, radius: fix.accuracy, color: '#38BDF8', weight: 1, fillOpacity: 0.12 } as any)}
          />
          <CircleMarker
            {...({ center: fix.position, radius: 7, color: '#fff', weight: 2, fillColor: '#0EA5E9', fillOpacity: 1 } as any)}
          >
            <Popup>You are here (±{Math.round(fix.accuracy)} m)</Popup>
          </CircleMarker>
        </>
      )}
    </>
  );
}

export const MapView: React.FC<MapViewProps> = ({
  itinerary,
  selectedDay,
  onSelectActivity,
  heightClass = "h-[450px]",
  showRoute = true,
  liveMap
}) => {
  const ownLiveMap = useLiveTripMap(liveMap ? EMPTY_ITINERARY : itinerary, selectedDay);
  const { stops, routes } = liveMap ?? ownLiveMap;

  const defaultCenter: LatLng = itinerary.destinationCoords
    ? [itinerary.destinationCoords.lat, itinerary.destinationCoords.lng]
    : [20.5937, 78.9629]; // India center fallback

  const points = useMemo(() => stops.map((s) => s.position), [stops]);

  return (
    <div className={`${heightClass} w-full rounded-3xl overflow-hidden border border-space-border shadow-2xl relative z-0`}>
      <MapContainer
        {...({
          center: defaultCenter,
          zoom: 13,
          scrollWheelZoom: true,
          className: "h-full w-full"
        } as any)}
      >
        <LayersControl {...({ position: 'topright' } as any)}>
          <LayersControl.BaseLayer {...({ checked: true, name: 'Street' } as any)}>
            <TileLayer
              {...({
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              } as any)}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer {...({ name: 'Satellite' } as any)}>
            <TileLayer
              {...({
                attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              } as any)}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <FitBounds points={points} fallback={defaultCenter} />
        <LiveLocation />

        {/* One line per day: real roads when routing is live, dashed straight lines otherwise */}
        {showRoute && routes.map((route) => route.path.length > 1 && (
          <Polyline
            key={`${route.day}-${route.live}-${route.path.length}`}
            {...({
              positions: route.path,
              color: dayColor(route.day),
              weight: route.live ? 5 : 4,
              opacity: 0.85,
              dashArray: route.live ? undefined : "6, 8"
            } as any)}
          />
        ))}

        {stops.map((stop) => (
          <Marker
            key={`${stop.activity.id}-${stop.day}-${stop.order}`}
            {...({ icon: stopIcon(stop.order, dayColor(stop.day)) } as any)}
            position={stop.position}
            eventHandlers={{
              click: () => onSelectActivity && onSelectActivity(stop.activity)
            }}
          >
            <Popup>
              <div className="p-3 max-w-[220px]">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded-md">
                    Day {stop.day} · {stop.activity.timeSlot}
                  </span>
                  <span className="text-[10px] font-bold text-typo-muted">
                    {stop.activity.activityType}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-typo-primary leading-tight mb-1">{stop.activity.name}</h4>
                <p className="text-xs text-typo-secondary leading-snug line-clamp-2">{stop.activity.location}</p>
                {!stop.verified && (
                  <p className="text-[10px] text-typo-muted font-semibold mt-1">Approximate position</p>
                )}
                <div className="mt-2.5 pt-2 border-t border-space-border flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-brand-primary">
                    {stop.activity.cost === 0 ? 'Free' : `₹${stop.activity.cost.toLocaleString()}`}
                  </span>
                  <a
                    href={liveMapService.directionsUrl(stop.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-wider text-brand-primary flex items-center gap-1"
                  >
                    <Navigation size={11} /> Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

/** Stand-in itinerary so the hook stays idle when a parent supplies the live data. */
const EMPTY_ITINERARY = { days: [] } as unknown as Itinerary;

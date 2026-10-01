import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Itinerary, Activity } from '../types';

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
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  itinerary, 
  selectedDay, 
  onSelectActivity,
  heightClass = "h-[450px]",
  showRoute = true
}) => {
  const defaultCenter: [number, number] = itinerary.destinationCoords 
    ? [itinerary.destinationCoords.lat, itinerary.destinationCoords.lng] 
    : [20.5937, 78.9629]; // India center fallback

  const activities = selectedDay
    ? itinerary.days.find(d => d.day === selectedDay)?.activities || []
    : itinerary.days.flatMap(day => day.activities);

  const validActivities = activities.filter(a => a.coordinates && a.coordinates.lat && a.coordinates.lng);

  const routePositions: [number, number][] = validActivities.map(a => [
    a.coordinates!.lat,
    a.coordinates!.lng
  ]);

  return (
    <div className={`${heightClass} w-full rounded-3xl overflow-hidden border border-space-border shadow-2xl relative z-0`}>
      <MapContainer 
        {...({
          center: defaultCenter, 
          zoom: 13, 
          scrollWheelZoom: false,
          className: "h-full w-full"
        } as any)}
      >
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          } as any)}
        />
        <ChangeView center={defaultCenter} />

        {showRoute && routePositions.length > 1 && (
          <Polyline 
            {...({
              positions: routePositions,
              color: "#97A87A",
              weight: 4,
              opacity: 0.8,
              dashArray: "6, 8"
            } as any)}
          />
        )}

        {validActivities.map((activity: Activity, index: number) => (
          <Marker 
            key={`${activity.id}-${index}`} 
            position={[activity.coordinates!.lat, activity.coordinates!.lng]}
            eventHandlers={{
              click: () => onSelectActivity && onSelectActivity(activity)
            }}
          >
            <Popup>
              <div className="p-3 max-w-[220px]">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded-md">
                    {activity.timeSlot}
                  </span>
                  <span className="text-[10px] font-bold text-typo-muted">
                    {activity.activityType}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-typo-primary leading-tight mb-1">{activity.name}</h4>
                <p className="text-xs text-typo-secondary leading-snug line-clamp-2">{activity.location}</p>
                <div className="mt-2.5 pt-2 border-t border-space-border flex items-center justify-between">
                  <span className="text-xs font-black text-brand-primary">
                    {activity.cost === 0 ? 'Free' : `₹${activity.cost.toLocaleString()}`}
                  </span>
                  {activity.estimatedDuration && (
                    <span className="text-[10px] text-typo-muted font-semibold">
                      ⏱ {activity.estimatedDuration}
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

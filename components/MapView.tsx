import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Itinerary, Activity } from '../types';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
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
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ itinerary }) => {
    const defaultCenter: [number, number] = itinerary.destinationCoords 
        ? [itinerary.destinationCoords.lat, itinerary.destinationCoords.lng] 
        : [0, 0];

    const allActivities = itinerary.days.flatMap(day => day.activities);

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-space-border shadow-lg z-0">
            <MapContainer 
                center={defaultCenter} 
                zoom={13} 
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={defaultCenter} />
                {allActivities.map((activity: Activity) => (
                    activity.coordinates && (
                        <Marker 
                            key={activity.id} 
                            position={[activity.coordinates.lat, activity.coordinates.lng]}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-typo-primary">{activity.name}</h3>
                                    <p className="text-sm text-typo-secondary leading-tight">{activity.location}</p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded-full">
                                            {activity.timeSlot}
                                        </span>
                                        <span className="text-xs font-bold text-brand-primary">
                                            ₹{activity.cost}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

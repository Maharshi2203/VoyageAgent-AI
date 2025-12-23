import React from 'react';
import { Cloud, CloudLightning, CloudRain, CloudSun, Sun, Thermometer } from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherWidgetProps {
    weather?: WeatherInfo;
    destination: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, destination }) => {
    if (!weather) return null;

    const getWeatherIcon = (condition: string) => {
        const lower = condition.toLowerCase();
        if (lower.includes('sunny') || lower.includes('clear')) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (lower.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (lower.includes('thunder')) return <CloudLightning className="w-8 h-8 text-purple-500" />;
        if (lower.includes('cloudy')) return <Cloud className="w-8 h-8 text-gray-400" />;
        return <CloudSun className="w-8 h-8 text-brand-primary" />;
    };

    return (
        <div className="flex items-center gap-4 p-4 card-deep rounded-2xl border-l-4 border-l-brand-primary">
            <div className="p-3 bg-brand-primary/10 rounded-xl">
                {getWeatherIcon(weather.condition)}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-typo-primary">Weather in {destination}</h3>
                    <div className="flex items-center gap-1 text-brand-primary font-bold">
                        <Thermometer className="w-4 h-4" />
                        <span>{weather.temperature}</span>
                    </div>
                </div>
                <p className="text-sm text-typo-secondary">
                    <span className="font-medium text-brand-primary">{weather.condition}:</span> {weather.forecast}
                </p>
            </div>
        </div>
    );
};

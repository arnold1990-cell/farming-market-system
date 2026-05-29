import { CloudRain } from 'lucide-react';

export default function WeatherWidget({ weather }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft space-y-2">
      <div className="flex items-center gap-2">
        <CloudRain size={18} className="text-farm-green" />
        <h4 className="text-sm font-semibold">Weather Snapshot</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Temp: <span className="font-semibold">{weather?.temperature ?? '--'} C</span></p>
        <p>Humidity: <span className="font-semibold">{weather?.humidity ?? '--'}%</span></p>
        <p>Rain: <span className="font-semibold">{weather?.rainForecast ?? '--'}</span></p>
        <p>Warning: <span className="font-semibold">{weather?.warning || 'None'}</span></p>
      </div>
      {!weather ? <p className="text-xs text-gray-500">TODO: Connect WeatherService endpoint when backend is ready.</p> : null}
    </div>
  );
}

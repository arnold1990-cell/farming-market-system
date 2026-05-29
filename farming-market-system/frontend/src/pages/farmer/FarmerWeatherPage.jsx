import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import WeatherWidget from '../../components/WeatherWidget';
import WeatherAlertCard from '../../components/WeatherAlertCard';
import HarvestCalendar from '../../components/HarvestCalendar';
import { getWeatherAlerts, markWeatherAlertRead } from '../../services/weatherAlertService';
import { getFarmerHarvestCalendar } from '../../services/harvestCalendarService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function FarmerWeatherPage() {
  const [alerts, setAlerts] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [a, c] = await Promise.all([getWeatherAlerts(), getFarmerHarvestCalendar()]);
      setAlerts(a || []);
      setCalendar(c || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load weather center'));
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout title="Weather & Harvest">
      <div className="space-y-3">
        <WeatherWidget weather={null} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Severe Weather Alerts</h3>
          {alerts.length === 0 ? <p className="text-sm text-gray-500">No active alerts.</p> : alerts.map((alert) => <WeatherAlertCard key={alert.id} alert={alert} onMarkRead={async (a) => { await markWeatherAlertRead(a.id); load(); }} />)}
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Harvest Calendar</h3>
          <HarvestCalendar items={calendar} showOwner />
        </div>
      </div>
    </AppLayout>
  );
}

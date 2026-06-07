import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import HarvestCalendar from '../../components/HarvestCalendar';
import { getFarmerHarvestCalendar } from '../../services/harvestCalendarService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function FarmerWeatherPage() {
  const [calendar, setCalendar] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setCalendar(await getFarmerHarvestCalendar());
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load harvest planner'));
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout title="Harvest Planner">
      <div className="space-y-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <h3 className="text-sm font-semibold">Upcoming Harvest Windows</h3>
          <p className="mt-2 text-sm text-gray-600">
            This planner is driven by your live product inventory and update dates. Weather alerts stay hidden until a real backend alert feed is implemented.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Harvest Calendar</h3>
          <HarvestCalendar items={calendar} showOwner />
        </div>
      </div>
    </AppLayout>
  );
}

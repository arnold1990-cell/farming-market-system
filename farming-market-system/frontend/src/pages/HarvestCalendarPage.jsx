import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import HarvestCalendar from '../components/HarvestCalendar';
import { getCustomerHarvestCalendar } from '../services/harvestCalendarService';
import { getApiErrorMessage } from '../utils/errorHandler';

export default function HarvestCalendarPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setItems(await getCustomerHarvestCalendar());
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to load harvest calendar'));
      }
    })();
  }, []);

  return (
    <AppLayout title="Harvest Calendar" hideHeader>
      {error ? <p className="mb-3 rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      <HarvestCalendar items={items} />
    </AppLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import HarvestCalendar from '../../components/HarvestCalendar';
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent } from '../../services/harvestCalendarService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function FarmerWeatherPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  const range = useMemo(() => {
    const first = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const last = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    return {
      dateFrom: first.toISOString().slice(0, 10),
      dateTo: last.toISOString().slice(0, 10)
    };
  }, [selectedMonth]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setEvents(await getCalendarEvents(range));
    } catch (eventError) {
      setError(getApiErrorMessage(eventError, 'Failed to load harvest planner'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [range.dateFrom, range.dateTo]);

  return (
    <AppLayout title="Harvest Planner" hideHeader>
      <HarvestCalendar
        events={events}
        loading={loading}
        error={error}
        selectedMonth={selectedMonth}
        onPreviousMonth={() => setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        onNextMonth={() => setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
        onCreate={async (payload) => { await createCalendarEvent(payload); await load(); }}
        onUpdate={async (id, payload) => { await updateCalendarEvent(id, payload); await load(); }}
        onDelete={async (id) => { await deleteCalendarEvent(id); await load(); }}
        canManage
      />
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import WeatherAlertCard from '../../components/WeatherAlertCard';
import { createWeatherAlert, getWeatherAlerts } from '../../services/weatherAlertService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', severity: 'LOW', targetArea: '', radiusKm: 25 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setAlerts(await getWeatherAlerts());
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load alerts'));
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await createWeatherAlert({ ...form, radiusKm: Number(form.radiusKm) });
      setForm({ title: '', message: '', severity: 'LOW', targetArea: '', radiusKm: 25 });
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to send alert'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Weather Alerts">
      <div className="space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-soft space-y-2">
          <h3 className="font-semibold text-sm">Broadcast Severe Weather Alert</h3>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full rounded-xl border border-gray-200 p-3 text-sm" rows={3} placeholder="Alert message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          <div className="grid grid-cols-3 gap-2">
            <select className="rounded-xl border border-gray-200 px-2 py-2 text-sm" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select>
            <Input placeholder="Target area" value={form.targetArea} onChange={(e) => setForm((f) => ({ ...f, targetArea: e.target.value }))} />
            <Input type="number" placeholder="Radius km" value={form.radiusKm} onChange={(e) => setForm((f) => ({ ...f, radiusKm: e.target.value }))} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button onClick={onSubmit} disabled={saving}>{saving ? 'Sending...' : 'Send Alert'}</Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Sent Alerts</h3>
          {alerts.length === 0 ? <p className="text-sm text-gray-500">No sent alerts.</p> : alerts.map((alert) => <WeatherAlertCard key={alert.id} alert={alert} />)}
        </div>
      </div>
    </AppLayout>
  );
}

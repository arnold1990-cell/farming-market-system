import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LocationPicker from '../../components/LocationPicker';
import BrandLogo from '../../components/BrandLogo';
import { upsertFarmerProfile } from '../../services/farmerProfileService';
import { getApiErrorMessage } from '../../utils/errorHandler';

const initial = {
  farmName: '',
  location: '',
  physicalAddress: '',
  latitude: '',
  longitude: '',
  city: '',
  country: '',
  description: '',
  contactNumber: ''
};

export default function FarmerProfilePage() {
  const links = [{ path: '/farmer/dashboard', label: 'Dashboard' }, { path: '/farmer/products', label: 'Products' }, { path: '/farmer/profile', label: 'Profile' }, { path: '/farmer/orders', label: 'Orders' }];
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const hasAddress = form.physicalAddress.trim().length > 0;
    const hasCoords = form.latitude !== '' && form.longitude !== '';
    if (!hasAddress && !hasCoords) {
      setSaving(false);
      setError('Provide physical address or map coordinates.');
      return;
    }
    try {
      await upsertFarmerProfile({
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        location: form.location || form.city || form.country || form.physicalAddress
      });
      setSuccess('Profile saved.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout links={links}>
      <div className="mx-auto max-w-4xl rounded-3xl border border-green-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <BrandLogo priority className="shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold text-farm-green">Farmer Profile Location</h1>
            <p className="text-sm text-slate-500">Keep your farm details aligned with the Pula Harvest marketplace.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Farm Name" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />
          <Input placeholder="Contact Number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <textarea className="w-full rounded-xl border border-gray-300 px-3 py-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <LocationPicker
          value={{ latitude: form.latitude, longitude: form.longitude, address: form.physicalAddress, city: form.city, country: form.country }}
          onChange={(next) => setForm((prev) => ({ ...prev, physicalAddress: next.address ?? '', latitude: next.latitude ?? '', longitude: next.longitude ?? '', city: next.city ?? prev.city, country: next.country ?? prev.country }))}
          error={form.physicalAddress.trim() || (form.latitude !== '' && form.longitude !== '') ? '' : 'Profile location is required.'}
          height={320}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}
        <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
      </div>
    </AppLayout>
  );
}

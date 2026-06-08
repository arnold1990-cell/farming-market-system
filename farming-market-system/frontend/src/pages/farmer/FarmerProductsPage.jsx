import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Search } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ToastStack from '../../components/ToastStack';
import LocationPicker from '../../components/LocationPicker';
import { getMyProducts, createProduct, updateProduct, deleteProduct, uploadProductImages } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { toMediaUrl } from '../../utils/media';

const units = ['kg', 'bag', 'crate', 'bunch', 'litre', 'tray', 'tonne'];
const currencies = ['BWP', 'USD', 'ZAR'];
const harvestStatuses = ['IN_FIELD', 'HARVESTED', 'PACKAGED', 'READY_FOR_DELIVERY'];

const initialForm = {
  name: '', description: '', categoryId: '', price: '', currency: 'BWP', quantity: '', unit: 'kg',
  locationName: '', latitude: '', longitude: '', pickupAddress: '', pickupLatitude: '', pickupLongitude: '', city: '', country: '', harvestStatus: 'IN_FIELD', harvestReadyDate: '', availabilityStatus: 'AVAILABLE', available: true, organic: false, deliveryAvailable: false,
  imageUrl: ''
};

function ImageSection({ title, files, setFiles }) {
  const onSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };
  return (
    <div className="card p-3">
      <p className="font-medium mb-2">{title} (max 5)</p>
      <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onSelect} />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {files.map((f, i) => (
          <div key={`${f.name}-${i}`} className="relative border rounded-lg p-1">
            <img src={URL.createObjectURL(f)} className="h-16 w-full object-cover rounded" />
            <button className="absolute top-0 right-0 text-xs bg-white px-1 rounded" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FarmerProductsPage() {
  const links = [{ path: '/farmer/dashboard', label: 'Dashboard' }, { path: '/farmer/products', label: 'Products' }, { path: '/farmer/profile', label: 'Profile' }, { path: '/farmer/orders', label: 'Orders' }, { path: '/marketplace', label: 'Marketplace' }];
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [filterHarvest, setFilterHarvest] = useState('ALL');
  const [filterAvailabilityStatus, setFilterAvailabilityStatus] = useState('ALL');
  const [fieldFiles, setFieldFiles] = useState([]);
  const [harvestFiles, setHarvestFiles] = useState([]);
  const [productFiles, setProductFiles] = useState([]);
  const [packagingFiles, setPackagingFiles] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const secondaryButtonClass = 'border border-farm-green/50 bg-[#F5FBF6] text-farm-green hover:bg-emerald-50';

  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ps, cs] = await Promise.all([getMyProducts(), getCategories()]);
      setProducts(ps || []);
      setCategories(cs || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter((p) => {
    const q = search.toLowerCase();
    if (q && !`${p.name} ${p.description} ${p.locationName}`.toLowerCase().includes(q)) return false;
    if (filterCurrency !== 'ALL' && p.currency !== filterCurrency) return false;
    if (filterHarvest !== 'ALL' && p.harvestStatus !== filterHarvest) return false;
    if (filterAvailabilityStatus !== 'ALL' && (p.availabilityStatus || (p.available ? 'AVAILABLE' : 'OUT_OF_STOCK')) !== filterAvailabilityStatus) return false;
    return true;
  }), [products, search, filterCurrency, filterHarvest, filterAvailabilityStatus]);

  const resetModal = () => {
    setStep(1);
    setEditing(null);
    setForm(initialForm);
    setFieldFiles([]); setHarvestFiles([]); setProductFiles([]); setPackagingFiles([]);
  };

  const onSave = async () => {
    try {
      const parsedCategoryId = Number(form.categoryId);
      if (!form.name.trim()) {
        pushToast('Product name is required.', 'warn');
        setStep(1);
        return;
      }
      if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
        pushToast('Category is required.', 'warn');
        setStep(1);
        return;
      }
      if (form.price === '' || Number(form.price) <= 0) {
        pushToast('Price is required.', 'warn');
        setStep(2);
        return;
      }
      if (form.quantity === '' || Number(form.quantity) < 0) {
        pushToast('Stock is required.', 'warn');
        setStep(2);
        return;
      }
      const hasAddress = (form.pickupAddress || '').trim().length > 0;
      const hasCoords = form.pickupLatitude !== '' && form.pickupLongitude !== '';
      if (!hasAddress && !hasCoords) {
        pushToast('Provide pickup address or map coordinates before saving.', 'warn');
        setStep(4);
        return;
      }
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        categoryId: parsedCategoryId,
        harvestReadyDate: form.harvestReadyDate || null,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        pickupLatitude: form.pickupLatitude === '' ? null : Number(form.pickupLatitude),
        pickupLongitude: form.pickupLongitude === '' ? null : Number(form.pickupLongitude),
        availabilityStatus: form.availabilityStatus || 'AVAILABLE',
        locationName: form.locationName || form.city || form.country || form.pickupAddress
      };
      delete payload.city;
      delete payload.country;
      payload.latitude = payload.pickupLatitude;
      payload.longitude = payload.pickupLongitude;
      console.log('Product form state before save:', form);
      console.log('Saving product payload:', payload);
      const saved = editing ? await updateProduct(editing.id, payload) : await createProduct(payload);

      if (fieldFiles.length) await uploadProductImages(saved.id, 'FIELD', fieldFiles);
      if (harvestFiles.length) await uploadProductImages(saved.id, 'HARVEST', harvestFiles);
      if (productFiles.length) await uploadProductImages(saved.id, 'PRODUCT', productFiles);
      if (packagingFiles.length) await uploadProductImages(saved.id, 'PACKAGING', packagingFiles);

      setOpen(false);
      resetModal();
      await load();
      pushToast(editing ? 'Product updated successfully' : 'Product created successfully', 'success');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to save product'), 'error');
    }
  };

  const onEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '', description: p.description || '', price: p.price || '', quantity: p.quantity || '', unit: p.unit || 'kg',
      imageUrl: p.imageUrl || '', categoryId: p.categoryId || '', locationName: p.locationName || '', latitude: p.latitude ?? '', longitude: p.longitude ?? '',
      pickupAddress: p.pickupAddress || '', pickupLatitude: p.pickupLatitude ?? p.latitude ?? '', pickupLongitude: p.pickupLongitude ?? p.longitude ?? '',
      city: '', country: '',
      currency: p.currency || 'BWP', harvestStatus: p.harvestStatus || 'IN_FIELD', harvestReadyDate: p.harvestReadyDate || '', availabilityStatus: p.availabilityStatus || (p.available ? 'AVAILABLE' : 'OUT_OF_STOCK'), available: !!p.available, organic: !!p.organic, deliveryAvailable: !!p.deliveryAvailable
    });
    setStep(1);
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteProduct(confirmDeleteId);
      pushToast('Product deleted successfully', 'success');
      setConfirmDeleteId(null);
      await load();
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to delete product'), 'error');
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { pushToast('Geolocation is not supported by this browser.', 'warn'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, pickupLatitude: Number(pos.coords.latitude.toFixed(6)), pickupLongitude: Number(pos.coords.longitude.toFixed(6)) })),
      () => pushToast('GPS permission denied. Please allow location access.', 'warn')
    );
  };

  if (loading) return <AppLayout links={links}><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout links={links}><EmptyState title="Error" subtitle={error} /></AppLayout>;

  return (
    <AppLayout links={links}>
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl font-semibold">Farmer Products</h1>
          <div className="flex gap-2">
            <Button className="bg-white text-farm-green border" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>{viewMode === 'table' ? 'Card View' : 'Table View'}</Button>
            <Button onClick={() => { resetModal(); setOpen(true); }}><Plus size={16} className="inline mr-1" />Add Product</Button>
          </div>
        </div>

        <div className="card p-3 grid md:grid-cols-5 gap-2">
          <div className="relative md:col-span-2"><Search size={16} className="absolute top-3 left-3 text-gray-400" /><Input className="pl-9" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={filterHarvest} onChange={(e) => setFilterHarvest(e.target.value)}><option value="ALL">All Harvest Status</option>{harvestStatuses.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={filterAvailabilityStatus} onChange={(e) => setFilterAvailabilityStatus(e.target.value)}><option value="ALL">All Availability</option><option value="AVAILABLE">AVAILABLE</option><option value="SOLD">SOLD</option><option value="OUT_OF_STOCK">OUT_OF_STOCK</option></Select>
          <Select value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}><option value="ALL">All Currencies</option>{currencies.map((c) => <option key={c}>{c}</option>)}</Select>
        </div>

        {!filtered.length ? <EmptyState title="No products" subtitle="Add your first listing" /> : viewMode === 'table' ? (
          <DataTable
            columns={[
              { key: 'name', title: 'Product' },
              { key: 'categoryName', title: 'Category', render: (r) => r.categoryName || '-' },
              { key: 'price', title: 'Price', render: (r) => `${r.currency} ${r.price}/${r.unit}` },
              { key: 'quantity', title: 'Stock' },
              { key: 'harvestStatus', title: 'Harvest Status' },
              { key: 'availabilityStatus', title: 'Availability' },
              { key: 'locationName', title: 'Location', render: (r) => <span className='inline-flex items-center gap-1'><MapPin size={14} />{r.locationName || '-'}</span> },
              { key: 'actions', title: 'Actions', render: (r) => <div className='flex gap-2'><button className='text-farm-green' onClick={() => onEdit(r)}>Edit</button><button className='text-red-600' onClick={() => setConfirmDeleteId(r.id)}>Delete</button><Link className='text-blue-600' to={`/farmer/products/${r.id}`}>View</Link></div> }
            ]}
            rows={filtered}
            mobileRender={(r) => <div>{r.name} - {r.currency} {r.price}/{r.unit}</div>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <Link to={`/farmer/products/${p.id}`} className="block">
                  {p.imageUrl ? (
                    <img src={toMediaUrl(p.imageUrl)} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="grid h-44 w-full place-items-center bg-gradient-to-br from-emerald-100 to-lime-50 text-sm font-semibold text-emerald-800">
                      No product image
                    </div>
                  )}
                </Link>
                <div className="p-4 space-y-2">
                  <Link to={`/farmer/products/${p.id}`} className="block text-lg font-semibold text-slate-900">{p.name}</Link>
                  <p>{p.currency} {p.price}/{p.unit}</p>
                  <p className="text-sm text-gray-600">Category: {p.categoryName || '-'}</p>
                  <p className="text-sm">Stock: {p.quantity}</p>
                  <p className="text-xs inline-flex items-center gap-1"><MapPin size={13} /> {p.locationName || '-'}</p>
                  <div className="flex gap-2"><button className='text-farm-green' onClick={() => onEdit(p)}>Edit</button><button className='text-red-600' onClick={() => setConfirmDeleteId(p.id)}>Delete</button><Link className='text-blue-600' to={`/farmer/products/${p.id}`}>View</Link></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${editing ? 'Edit' : 'Add'} Product - Step ${step}/5`}>
        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {step === 1 && <>
            <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            {categories.length === 0 ? <p className='text-xs text-amber-600'>No categories available yet. Contact admin or refresh after server starts seeding defaults.</p> : null}
            <Select value={form.harvestStatus} onChange={(e) => setForm({ ...form, harvestStatus: e.target.value })}>{harvestStatuses.map(s => <option key={s}>{s}</option>)}</Select>
            <Input placeholder="Harvest / market ready date" type="date" value={form.harvestReadyDate} onChange={(e) => setForm({ ...form, harvestReadyDate: e.target.value })} />
          </>}
          {step === 2 && <>
            <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{currencies.map(c => <option key={c}>{c}</option>)}</Select>
            <Input placeholder="Quantity / Stock" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{units.map(u => <option key={u}>{u}</option>)}</Select>
            <label className='flex items-center gap-2'><input type='checkbox' checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Availability</label>
            <label className='flex items-center gap-2'><input type='checkbox' checked={form.organic} onChange={(e) => setForm({ ...form, organic: e.target.checked })} /> Organic</label>
            <label className='flex items-center gap-2'><input type='checkbox' checked={form.deliveryAvailable} onChange={(e) => setForm({ ...form, deliveryAvailable: e.target.checked })} /> Delivery Available</label>
            <Select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="SOLD">SOLD</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </Select>
          </>}
          {step === 3 && <>
            <ImageSection title="Field Images" files={fieldFiles} setFiles={setFieldFiles} />
            <ImageSection title="Harvest Images" files={harvestFiles} setFiles={setHarvestFiles} />
            <ImageSection title="Product Images" files={productFiles} setFiles={setProductFiles} />
            <ImageSection title="Packaging Images" files={packagingFiles} setFiles={setPackagingFiles} />
          </>}
          {step === 4 && <>
            <Input placeholder="Location Name (optional label)" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
            <div className='grid grid-cols-2 gap-2'>
              <Input placeholder="Pickup Latitude" type="number" value={form.pickupLatitude} onChange={(e) => setForm({ ...form, pickupLatitude: e.target.value })} />
              <Input placeholder="Pickup Longitude" type="number" value={form.pickupLongitude} onChange={(e) => setForm({ ...form, pickupLongitude: e.target.value })} />
            </div>
            <Button className={secondaryButtonClass} onClick={useCurrentLocation}>Use My Current Location</Button>
            <LocationPicker
              value={{ latitude: form.pickupLatitude, longitude: form.pickupLongitude, address: form.pickupAddress, city: form.city, country: form.country }}
              onChange={(next) => setForm((prev) => ({
                ...prev,
                pickupLatitude: next.latitude ?? '',
                pickupLongitude: next.longitude ?? '',
                pickupAddress: next.address ?? '',
                city: next.city ?? '',
                country: next.country ?? ''
              }))}
              error={(form.pickupAddress || '').trim() || (form.pickupLatitude !== '' && form.pickupLongitude !== '') ? '' : 'Pickup address or map coordinates are required.'}
              height={280}
            />
            <p className='text-xs text-gray-600'>Selected: {form.pickupLatitude || '-'}, {form.pickupLongitude || '-'} | {form.pickupAddress || '-'}</p>
          </>}
          {step === 5 && <>
            <div className='card p-3 text-sm space-y-1'>
              <p><b>Name:</b> {form.name}</p>
              <p><b>Price:</b> {form.currency} {form.price}/{form.unit}</p>
              <p><b>Stock:</b> {form.quantity}</p>
              <p><b>Pickup Location:</b> {form.pickupAddress || form.locationName || '-'} ({form.pickupLatitude || '-'}, {form.pickupLongitude || '-'})</p>
              <p><b>Harvest:</b> {form.harvestStatus}</p>
              <p><b>Ready Date:</b> {form.harvestReadyDate || '-'}</p>
              <p><b>Images:</b> Field {fieldFiles.length}, Harvest {harvestFiles.length}, Product {productFiles.length}, Packaging {packagingFiles.length}</p>
            </div>
          </>}
          <div className='flex justify-between pt-2'>
            <Button className={secondaryButtonClass} onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
            {step < 5 ? <Button onClick={() => setStep((s) => Math.min(5, s + 1))}>Next</Button> : <Button onClick={onSave}>Save Product</Button>}
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button className={secondaryButtonClass} onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button className="bg-red-600" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

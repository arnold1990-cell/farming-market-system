import { useEffect, useMemo, useRef, useState } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, UserCheck, UserX, Eye } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  getFarmers,
  getFarmerById,
  createFarmer,
  approveFarmer,
  suspendFarmer,
  deleteFarmer
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/errorHandler';

const links = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/farmers', label: 'Farmers' },
  { path: '/admin/products', label: 'Products' },
  { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/categories', label: 'Categories' },
  { path: '/admin/deliveries', label: 'Deliveries' }
];

const statusMap = { ACTIVE: 'COMPLETED', PENDING: 'PENDING', SUSPENDED: 'CANCELLED' };

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('');
  const [targetFarmer, setTargetFarmer] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    farmName: '',
    location: '',
    description: '',
    status: 'PENDING'
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFarmers();
      const normalized = (data || []).map((f) => ({
        id: f.id,
        fullName: f.fullName || f.name || 'Farmer',
        email: f.email || '-',
        phoneNumber: f.phoneNumber || '-',
        farmName: f.farmName || `Farm #${f.id}`,
        location: f.location || 'Unknown',
        description: f.description || '',
        productsCount: f.productsCount ?? 0,
        totalSales: f.totalSales ?? 0,
        status: f.enabled === false ? 'SUSPENDED' : (f.status || 'ACTIVE'),
        joinedDate: f.joinedDate || new Date().toISOString().slice(0, 10),
        recentProducts: f.recentProducts || [],
        recentOrders: f.recentOrders || []
      }));
      setFarmers(normalized);
    } catch (e) {
      setFarmers([]);
      setError(getApiErrorMessage(e, 'Could not load farmers.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const locations = useMemo(() => ['ALL', ...new Set(farmers.map((f) => f.location))], [farmers]);

  const filtered = useMemo(() => {
    let data = [...farmers];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((f) =>
        [f.fullName, f.email, f.farmName, f.location].some((v) => String(v || '').toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'ALL') data = data.filter((f) => f.status === statusFilter);
    if (locationFilter !== 'ALL') data = data.filter((f) => f.location === locationFilter);

    if (sortBy === 'newest') data.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    if (sortBy === 'oldest') data.sort((a, b) => new Date(a.joinedDate) - new Date(b.joinedDate));
    if (sortBy === 'most-products') data.sort((a, b) => b.productsCount - a.productsCount);
    if (sortBy === 'highest-sales') data.sort((a, b) => b.totalSales - a.totalSales);

    return data;
  }, [farmers, search, statusFilter, locationFilter, sortBy]);

  const stats = useMemo(() => ({
    total: farmers.length,
    active: farmers.filter((f) => f.status === 'ACTIVE').length,
    pending: farmers.filter((f) => f.status === 'PENDING').length,
    suspended: farmers.filter((f) => f.status === 'SUSPENDED').length
  }), [farmers]);

  const showFarmer = async (id) => {
    try {
      const data = await getFarmerById(id);
      setSelectedFarmer({ ...filtered.find((f) => f.id === id), ...data });
    } catch {
      setSelectedFarmer(filtered.find((f) => f.id === id));
    }
    setViewOpen(true);
  };

  const onApprove = async (id) => {
    try {
      await approveFarmer(id);
      setNotice('Farmer approved successfully');
      setFarmers((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'ACTIVE' } : f)));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to approve farmer'));
    }
  };

  const openConfirm = (type, farmer) => {
    setConfirmType(type);
    setTargetFarmer(farmer);
    setConfirmOpen(true);
    setMenuOpenId(null);
  };

  const onConfirmAction = async () => {
    if (!targetFarmer) return;
    try {
      if (confirmType === 'suspend') {
        await suspendFarmer(targetFarmer.id);
        setNotice('Farmer suspended successfully');
        setFarmers((prev) => prev.map((f) => (f.id === targetFarmer.id ? { ...f, status: 'SUSPENDED' } : f)));
      }
      if (confirmType === 'delete') {
        await deleteFarmer(targetFarmer.id);
        setNotice('Farmer deleted successfully');
        setFarmers((prev) => prev.filter((f) => f.id !== targetFarmer.id));
      }
    } catch (e) {
      setError(getApiErrorMessage(e, `${confirmType} action failed`));
    } finally {
      setConfirmOpen(false);
      setTargetFarmer(null);
    }
  };

  const onCreate = async () => {
    try {
      await createFarmer({ ...form, role: 'FARMER' });
      setNotice('Farmer created successfully');
      setAddOpen(false);
      setForm({ fullName: '', email: '', phoneNumber: '', password: '', farmName: '', location: '', description: '', status: 'PENDING' });
      load();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to create farmer'));
    }
  };

  const columns = [
    {
      key: 'farmer',
      title: 'Farmer',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-farm-mint text-farm-green grid place-items-center font-semibold">
            {(r.fullName || 'F').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{r.fullName}</p>
            <p className="text-xs text-gray-500">{r.email}</p>
          </div>
        </div>
      )
    },
    { key: 'farmName', title: 'Farm Name' },
    { key: 'location', title: 'Location' },
    { key: 'phoneNumber', title: 'Contact' },
    { key: 'productsCount', title: 'Products' },
    { key: 'totalSales', title: 'Total Sales', render: (r) => `BWP ${Number(r.totalSales || 0).toLocaleString()}` },
    { key: 'status', title: 'Status', render: (r) => <StatusBadge status={statusMap[r.status] || 'PENDING'} /> },
    { key: 'joinedDate', title: 'Joined Date' },
    {
      key: 'actions',
      title: 'Actions',
      render: (r) => (
        <div className="relative flex items-center gap-2" ref={menuOpenId === r.id ? menuRef : null}>
          <button className="text-farm-green" onClick={() => showFarmer(r.id)}><Eye size={16} /></button>
          <button className="text-emerald-600" onClick={() => onApprove(r.id)}><UserCheck size={16} /></button>
          <button className="text-gray-500" onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}><MoreHorizontal size={16} /></button>
          {menuOpenId === r.id && (
            <div className="absolute right-0 top-7 z-20 bg-white border rounded-xl shadow-soft p-1 w-32">
              <button className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded" onClick={() => { showFarmer(r.id); setMenuOpenId(null); }}>View</button>
              <button className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded text-amber-700" onClick={() => openConfirm('suspend', r)}>Suspend</button>
              <button className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded text-red-600" onClick={() => openConfirm('delete', r)}>Delete</button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <AppLayout links={links}>
      <div className="space-y-5">
        <section className="rounded-[30px] bg-white/90 p-4 shadow-soft">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Farmer moderation</p>
              <h1 className="text-2xl font-black text-slate-900">Approve growers and watch marketplace quality</h1>
              <p className="mt-1 text-sm text-slate-500">Use live user data only. This screen no longer falls back to mock farmers when an endpoint fails.</p>
            </div>
            <Button className="flex items-center gap-2 self-start" onClick={() => setAddOpen(true)}><Plus size={16} />Add Farmer</Button>
          </div>
        </section>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Farmers</h2>
            <p className="text-sm text-gray-500">Manage farmer profiles, approvals, and marketplace activity</p>
          </div>
        </div>

        {notice && <div className="card p-3 text-sm text-green-700 bg-green-50">{notice}</div>}
        {error && <div className="card p-3 text-sm text-red-700 bg-red-50">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4"><p className="text-sm text-gray-500">Total Farmers</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="card p-4"><p className="text-sm text-gray-500">Active Farmers</p><p className="text-2xl font-bold text-green-700">{stats.active}</p></div>
          <div className="card p-4"><p className="text-sm text-gray-500">Pending Approval</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></div>
          <div className="card p-4"><p className="text-sm text-gray-500">Suspended Farmers</p><p className="text-2xl font-bold text-red-600">{stats.suspended}</p></div>
        </div>

        <div className="card p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input className="pl-9" placeholder="Search name, email, farm, location" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </Select>
          <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            {locations.map((l) => <option key={l} value={l}>{l === 'ALL' ? 'All Locations' : l}</option>)}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-products">Most Products</option>
            <option value="highest-sales">Highest Sales</option>
          </Select>
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="No farmers found" subtitle="Try adjusting your filters or add a new farmer." />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable columns={columns} rows={filtered} mobileRender={() => null} />
            </div>
            <div className="md:hidden space-y-3">
              {filtered.map((f) => (
                <div key={f.id} className="card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-farm-mint text-farm-green grid place-items-center font-semibold">
                      {(f.fullName || 'F').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{f.fullName}</p>
                      <p className="text-xs text-gray-500">{f.farmName}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>{f.location}</p>
                    <p>{f.phoneNumber}</p>
                    <p className="text-gray-600">{f.email}</p>
                    <p>Products: {f.productsCount}</p>
                    <p>Sales: BWP {Number(f.totalSales || 0).toLocaleString()}</p>
                    <StatusBadge status={statusMap[f.status] || 'PENDING'} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="text-farm-green text-xs" onClick={() => showFarmer(f.id)}>View</button>
                    <button className="text-emerald-600 text-xs" onClick={() => onApprove(f.id)}>Approve</button>
                    <button className="text-amber-600 text-xs" onClick={() => openConfirm('suspend', f)}>Suspend</button>
                    <button className="text-red-600 text-xs" onClick={() => openConfirm('delete', f)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Farmer Details">
        {selectedFarmer ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {selectedFarmer.fullName}</p>
            <p><span className="font-medium">Email:</span> {selectedFarmer.email}</p>
            <p><span className="font-medium">Phone:</span> {selectedFarmer.phoneNumber || '-'}</p>
            <p><span className="font-medium">Farm:</span> {selectedFarmer.farmName || '-'}</p>
            <p><span className="font-medium">Location:</span> {selectedFarmer.location || '-'}</p>
            <p><span className="font-medium">Description:</span> {selectedFarmer.description || '-'}</p>
            <p><span className="font-medium">Products Count:</span> {selectedFarmer.productsCount || 0}</p>
            <p><span className="font-medium">Total Sales:</span> BWP {Number(selectedFarmer.totalSales || 0).toLocaleString()}</p>
            <p><span className="font-medium">Status:</span> <StatusBadge status={statusMap[selectedFarmer.status] || 'PENDING'} /></p>
            <p><span className="font-medium">Joined:</span> {selectedFarmer.joinedDate || '-'}</p>
            <p><span className="font-medium">Recent Products:</span> {(selectedFarmer.recentProducts || []).join(', ') || '-'}</p>
            <p><span className="font-medium">Recent Orders:</span> {(selectedFarmer.recentOrders || []).join(', ') || '-'}</p>
          </div>
        ) : <EmptyState title="No details" subtitle="Farmer profile unavailable." />}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Farmer">
        <div className="space-y-3">
          <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Phone number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input placeholder="Farm name" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />
          <Input placeholder="Farm location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input placeholder="Farm description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </Select>
          <Button className="w-full" onClick={onCreate}>Create Farmer</Button>
        </div>
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={confirmType === 'delete' ? 'Delete Farmer' : 'Suspend Farmer'}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmType === 'delete'
              ? `Are you sure you want to delete ${targetFarmer?.fullName || 'this farmer'}? This action cannot be undone.`
              : `Are you sure you want to suspend ${targetFarmer?.fullName || 'this farmer'}?`}
          </p>
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <Button className={confirmType === 'delete' ? 'bg-red-600' : 'bg-amber-600'} onClick={onConfirmAction}>
              {confirmType === 'delete' ? 'Delete' : 'Suspend'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

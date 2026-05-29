import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ToastStack from '../../components/ToastStack';
import MapboxLocationPicker from '../../components/MapboxLocationPicker';
import { deleteProduct, deleteProductImage, getProductById, getProductOrders, reorderProductImages, setPrimaryImage, updateProductAvailability } from '../../services/productService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { toMediaUrl } from '../../utils/media';

export default function FarmerProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const links = [{ path: '/farmer/dashboard', label: 'Dashboard' }, { path: '/farmer/products', label: 'Products' }, { path: '/farmer/orders', label: 'Orders' }, { path: '/marketplace', label: 'Marketplace' }];
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragInfo, setDragInfo] = useState(null);

  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const load = async () => {
    try {
      const [p, os] = await Promise.all([getProductById(id), getProductOrders(id).catch(() => [])]);
      setProduct(p);
      setOrders(os || []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load product details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onDelete = async () => {
    try {
      await deleteProduct(id);
      navigate('/farmer/products');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to delete product'), 'error');
    }
  };

  const onSetAvailability = async (availabilityStatus) => {
    try {
      const updated = await updateProductAvailability(id, availabilityStatus);
      setProduct(updated);
      pushToast(`Product marked as ${availabilityStatus}`, 'success');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to update availability'), 'error');
    }
  };

  const onSetPrimary = async (imageId) => {
    try {
      const updated = await setPrimaryImage(imageId);
      setProduct(updated);
      pushToast('Primary image updated', 'success');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to set primary image'), 'error');
    }
  };

  const onDeleteImage = async (imageId) => {
    try {
      await deleteProductImage(imageId);
      await load();
      pushToast('Image deleted', 'success');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to delete image'), 'error');
    }
  };

  const onDragStart = (group, index) => setDragInfo({ group, index });
  const onDrop = async (group, index) => {
    if (!dragInfo || dragInfo.group !== group || dragInfo.index === index) return;
    const arr = [...(groups[group] || [])];
    const [moved] = arr.splice(dragInfo.index, 1);
    arr.splice(index, 0, moved);
    setDragInfo(null);
    try {
      await reorderProductImages(id, group, arr.map((i) => i.id));
      await load();
      pushToast('Image order updated', 'success');
    } catch (e) {
      pushToast(getApiErrorMessage(e, 'Failed to reorder images'), 'error');
    }
  };

  if (loading) return <AppLayout links={links}><LoadingSpinner /></AppLayout>;
  if (error || !product) return <AppLayout links={links}><EmptyState title='Error' subtitle={error || 'Product not found'} /></AppLayout>;

  const groups = {
    FIELD: product.images?.filter((i) => i.imageType === 'FIELD') || [],
    HARVEST: product.images?.filter((i) => i.imageType === 'HARVEST') || [],
    PRODUCT: product.images?.filter((i) => i.imageType === 'PRODUCT') || [],
    PACKAGING: product.images?.filter((i) => i.imageType === 'PACKAGING') || []
  };

  return <AppLayout links={links}><ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} /><div className='space-y-4'><div className='flex justify-between'><h1 className='text-2xl font-semibold'>{product.name}</h1><div className='flex gap-2'><Button className='bg-white text-farm-green border' onClick={() => navigate('/farmer/products')}>Back</Button><Button className='bg-amber-600' onClick={() => onSetAvailability('SOLD')}>Mark as Sold</Button><Button className='bg-farm-green' onClick={() => onSetAvailability('AVAILABLE')}>Mark as Available</Button><Button className='bg-red-600' onClick={() => setConfirmOpen(true)}>Delete</Button></div></div><div className='card p-4 grid md:grid-cols-2 gap-4'><div className='space-y-2 text-sm'><p><b>Price:</b> {product.currency} {product.price}/{product.unit}</p><p><b>Quantity:</b> {product.quantity}</p><p><b>Category:</b> {product.categoryId}</p><p><b>Harvest:</b> {product.harvestStatus}</p><p><b>Availability:</b> {product.availabilityStatus || (product.available ? 'AVAILABLE' : 'OUT_OF_STOCK')}</p><p><b>Pickup Address:</b> {product.pickupAddress || product.locationName || '-'}</p><p><b>Coordinates:</b> {product.pickupLatitude ?? '-'}, {product.pickupLongitude ?? '-'}</p><p><b>Organic:</b> {String(product.organic)}</p><p><b>Delivery Available:</b> {String(product.deliveryAvailable)}</p></div><div>{product.pickupLatitude && product.pickupLongitude ? <MapboxLocationPicker latitude={product.pickupLatitude} longitude={product.pickupLongitude} onLocationChange={() => {}} height={240} /> : <EmptyState title='No map location' subtitle='No GPS coordinates were set.' />}</div></div><div className='grid md:grid-cols-2 gap-4'>{Object.entries(groups).map(([k, arr]) => <div key={k} className='card p-3'><h3 className='font-semibold mb-2'>{k} Images <span className='text-xs text-gray-500'>(drag to reorder)</span></h3>{arr.length ? <div className='grid grid-cols-3 gap-2'>{arr.map((img, idx) => <div key={img.id} className='relative' draggable onDragStart={() => onDragStart(k, idx)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(k, idx)}><img src={toMediaUrl(img.imageUrl)} className='h-20 w-full object-cover rounded' /><div className='absolute bottom-1 left-1 flex gap-1'><button onClick={() => onSetPrimary(img.id)} className='text-[10px] bg-white px-1 rounded border'>Primary</button><button onClick={() => onDeleteImage(img.id)} className='text-[10px] bg-red-50 text-red-700 px-1 rounded border border-red-200'>Delete</button></div></div>)}</div> : <p className='text-sm text-gray-500'>No images</p>}</div>)}</div><div className='card p-4'><h3 className='font-semibold mb-2'>Orders Related to Product</h3>{orders.length ? <DataTable columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }, { key: 'totalAmount', title: 'Total' }]} rows={orders.map(o => ({ ...o, id: `#${o.id}` }))} mobileRender={(r) => <div>{r.id} - {r.status}</div>} /> : <p className='text-sm text-gray-500'>No related orders yet.</p>}</div></div><Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title='Delete Product'><div className='space-y-4'><p className='text-sm text-gray-600'>Delete this product? This action cannot be undone.</p><div className='flex justify-end gap-2'><button className='px-3 py-2 rounded-xl border' onClick={() => setConfirmOpen(false)}>Cancel</button><Button className='bg-red-600' onClick={onDelete}>Delete</Button></div></div></Modal></AppLayout>;
}

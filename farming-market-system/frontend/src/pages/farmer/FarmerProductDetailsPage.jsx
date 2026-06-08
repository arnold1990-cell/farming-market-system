import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ToastStack from '../../components/ToastStack';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ProductDetailsView from '../../components/ProductDetailsView';
import { deleteProduct, deleteProductImage, getProductById, getProductOrders, reorderProductImages, setPrimaryImage, updateProductAvailability } from '../../services/productService';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { toMediaUrl } from '../../utils/media';
import api from '../../services/api';

export default function FarmerProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const links = [{ path: '/farmer/dashboard', label: 'Dashboard' }, { path: '/farmer/products', label: 'Products' }, { path: '/farmer/orders', label: 'Orders' }, { path: '/marketplace', label: 'Marketplace' }];
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragInfo, setDragInfo] = useState(null);

  const pushToast = (message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== toastId)), 3500);
  };

  const load = async () => {
    try {
      const [productResponse, orderResponse, reviewResponse] = await Promise.all([
        getProductById(id),
        getProductOrders(id).catch(() => []),
        api.get(`/reviews/products/${id}`).then((response) => response.data).catch(() => [])
      ]);
      setProduct(productResponse);
      setOrders(orderResponse || []);
      setReviews(reviewResponse || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load product details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onDelete = async () => {
    try {
      await deleteProduct(id);
      navigate('/farmer/products');
    } catch (err) {
      pushToast(getApiErrorMessage(err, 'Failed to delete product'), 'error');
    }
  };

  const onSetAvailability = async (availabilityStatus) => {
    try {
      const updated = await updateProductAvailability(id, availabilityStatus);
      setProduct(updated);
      pushToast(`Product marked as ${availabilityStatus}`, 'success');
    } catch (err) {
      pushToast(getApiErrorMessage(err, 'Failed to update availability'), 'error');
    }
  };

  const onSetPrimary = async (imageId) => {
    try {
      const updated = await setPrimaryImage(imageId);
      setProduct(updated);
      pushToast('Primary image updated', 'success');
    } catch (err) {
      pushToast(getApiErrorMessage(err, 'Failed to set primary image'), 'error');
    }
  };

  const onDeleteImage = async (imageId) => {
    try {
      await deleteProductImage(imageId);
      await load();
      pushToast('Image deleted', 'success');
    } catch (err) {
      pushToast(getApiErrorMessage(err, 'Failed to delete image'), 'error');
    }
  };

  const onDragStart = (group, index) => setDragInfo({ group, index });
  const onDrop = async (group, index) => {
    if (!dragInfo || dragInfo.group !== group || dragInfo.index === index) return;
    const items = [...(groups[group] || [])];
    const [moved] = items.splice(dragInfo.index, 1);
    items.splice(index, 0, moved);
    setDragInfo(null);
    try {
      await reorderProductImages(id, group, items.map((item) => item.id));
      await load();
      pushToast('Image order updated', 'success');
    } catch (err) {
      pushToast(getApiErrorMessage(err, 'Failed to reorder images'), 'error');
    }
  };

  if (loading) return <AppLayout links={links}><LoadingSpinner /></AppLayout>;
  if (error || !product) return <AppLayout links={links}><EmptyState title="Error" subtitle={error || 'Product not found'} /></AppLayout>;

  const groups = {
    FIELD: product.images?.filter((image) => image.imageType === 'FIELD') || [],
    HARVEST: product.images?.filter((image) => image.imageType === 'HARVEST') || [],
    PRODUCT: product.images?.filter((image) => image.imageType === 'PRODUCT') || [],
    PACKAGING: product.images?.filter((image) => image.imageType === 'PACKAGING') || []
  };

  const actionPanel = (
    <section className="rounded-[28px] bg-white p-4 shadow-soft">
      <div className="flex flex-wrap gap-2">
        <Button className="bg-white text-farm-green border" onClick={() => navigate('/farmer/products')}>Back to listings</Button>
        <Button className="bg-amber-600" onClick={() => onSetAvailability('SOLD')}>Mark as Sold</Button>
        <Button className="bg-farm-green" onClick={() => onSetAvailability('AVAILABLE')}>Mark as Available</Button>
        <Button className="bg-red-600" onClick={() => setConfirmOpen(true)}>Delete</Button>
      </div>
    </section>
  );

  return (
    <AppLayout links={links}>
      <ToastStack toasts={toasts} onClose={(toastId) => setToasts((prev) => prev.filter((toast) => toast.id !== toastId))} />
      <div className="space-y-4">
        <ProductDetailsView
          product={product}
          reviews={reviews}
          onBack={() => navigate('/farmer/products')}
          showPurchaseActions={false}
          actionPanel={actionPanel}
        />

        <section className="grid gap-4 md:grid-cols-2">
          {Object.entries(groups).map(([group, images]) => (
            <div key={group} className="rounded-[28px] bg-white p-4 shadow-soft">
              <h3 className="font-semibold text-slate-900">{group} Images</h3>
              <p className="mt-1 text-xs text-slate-500">Drag to reorder. Set a primary product image or remove outdated uploads.</p>
              {images.length ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative"
                      draggable
                      onDragStart={() => onDragStart(group, index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onDrop(group, index)}
                    >
                      <img src={toMediaUrl(image.imageUrl)} alt={group} className="h-20 w-full rounded-xl object-cover" />
                      <div className="absolute bottom-1 left-1 flex gap-1">
                        <button type="button" onClick={() => onSetPrimary(image.id)} className="rounded border bg-white px-1 text-[10px]">Primary</button>
                        <button type="button" onClick={() => onDeleteImage(image.id)} className="rounded border border-red-200 bg-red-50 px-1 text-[10px] text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No images uploaded.</p>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-soft">
          <h3 className="mb-2 font-semibold text-slate-900">Orders Related to Product</h3>
          {orders.length ? (
            <DataTable
              columns={[{ key: 'id', title: 'Order' }, { key: 'status', title: 'Status' }, { key: 'totalAmount', title: 'Total' }]}
              rows={orders.map((order) => ({ ...order, id: `#${order.id}` }))}
              mobileRender={(row) => <div>{row.id} - {row.status}</div>}
            />
          ) : (
            <p className="text-sm text-slate-500">No related orders yet.</p>
          )}
        </section>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button className="rounded-xl border px-3 py-2" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <Button className="bg-red-600" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

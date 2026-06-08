import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ToastStack from '../components/ToastStack';
import ProductDetailsView from '../components/ProductDetailsView';
import { getPublicProductById } from '../services/productService';
import { addToCart } from '../services/cartService';
import { getApiErrorMessage } from '../utils/errorHandler';
import api from '../services/api';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

  const pushToast = (type, message) => {
    const toastId = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: toastId, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== toastId)), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [productResponse, reviewResponse] = await Promise.all([
          getPublicProductById(id),
          api.get(`/reviews/products/${id}`).then((response) => response.data).catch(() => [])
        ]);
        setProduct(productResponse);
        setReviews(reviewResponse || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load product'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const onAdd = async (quantity) => {
    try {
      await addToCart(product, quantity);
      pushToast('success', 'Added to cart');
    } catch (err) {
      pushToast('error', getApiErrorMessage(err, 'Could not add to cart'));
    }
  };

  if (loading) return <AppLayout title="Product"><LoadingSpinner /></AppLayout>;
  if (error || !product) return <AppLayout title="Product"><EmptyState title="Not Found" subtitle={error || 'Product not found'} /></AppLayout>;

  return (
    <AppLayout title="Product details" hideHeader>
      <ToastStack toasts={toasts} onClose={(toastId) => setToasts((prev) => prev.filter((toast) => toast.id !== toastId))} />
      <ProductDetailsView product={product} reviews={reviews} onBack={() => navigate(-1)} onAdd={onAdd} />
    </AppLayout>
  );
}

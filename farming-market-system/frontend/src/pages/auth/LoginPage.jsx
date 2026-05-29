import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { loginUser, logoutUser } from '../../services/authService';

const roleHome = {
  BUYER: '/',
  FARMER: '/farmer/dashboard',
  ADMIN: '/admin/dashboard',
  DELIVERY_AGENT: '/agent/dashboard'
};

const roleLabels = {
  ADMIN: 'Admin',
  FARMER: 'Farmer',
  BUYER: 'Buyer',
  DELIVERY_AGENT: 'Delivery Agent'
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser({ email: email.trim(), password });
      if (data.role !== selectedRole) {
        logoutUser();
        setError(`This account is not registered as ${roleLabels[selectedRole]}.`);
        return;
      }
      navigate(roleHome[data.role] || '/', { replace: true });
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout><form onSubmit={onSubmit} className="card p-6 space-y-4"><h1 className="text-2xl font-bold">Login to Pula Harvest</h1>{error && <p className="text-sm text-red-600">{error}</p>}<div><label className="mb-1 block text-sm font-medium text-gray-700">Login as</label><Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="ADMIN">Admin</option><option value="FARMER">Farmer</option><option value="BUYER">Buyer</option><option value="DELIVERY_AGENT">Delivery Agent</option></Select></div><Input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /><Input placeholder="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /><Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button></form></AuthLayout>;
}

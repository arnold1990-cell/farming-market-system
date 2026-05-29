import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { registerUser } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/errorHandler';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', role: 'BUYER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const onChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await registerUser(form);
      setSuccess('Registration successful on Pula Harvest. Please login.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout><form onSubmit={onSubmit} className="card p-6 space-y-4"><h1 className="text-2xl font-bold">Create Your Pula Harvest Account</h1>{error && <p className="text-sm text-red-600">{error}</p>}{success && <p className="text-sm text-green-700">{success}</p>}<Input placeholder="Full Name" required value={form.fullName} onChange={(e) => onChange('fullName', e.target.value)} /><Input placeholder="Email" type="email" required value={form.email} onChange={(e) => onChange('email', e.target.value)} /><Input placeholder="Phone Number" value={form.phoneNumber} onChange={(e) => onChange('phoneNumber', e.target.value)} /><Input placeholder="Password" type="password" required value={form.password} onChange={(e) => onChange('password', e.target.value)} /><Select value={form.role} onChange={(e) => onChange('role', e.target.value)}><option value="BUYER">BUYER</option><option value="FARMER">FARMER</option><option value="DELIVERY_AGENT">DELIVERY_AGENT</option></Select><Button className="w-full" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button></form></AuthLayout>;
}

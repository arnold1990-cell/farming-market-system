import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import DataTable from '../../components/DataTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getUsers, disableUser, getAllProducts, getAllOrdersAdmin, getAllFarmers, getDeliveries, assignDelivery } from '../../services/adminService';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import { getApiErrorMessage } from '../../utils/errorHandler';

const links = [{ path: '/admin/dashboard', label: 'Dashboard' }, { path: '/admin/users', label: 'Users' }, { path: '/admin/farmers', label: 'Farmers' }, { path: '/admin/products', label: 'Products' }, { path: '/admin/orders', label: 'Orders' }, { path: '/admin/categories', label: 'Categories' }, { path: '/admin/deliveries', label: 'Deliveries' }];

export default function AdminManagementPage() {
  const { pathname } = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const kind = useMemo(() => {
    if (pathname.endsWith('/users')) return 'users';
    if (pathname.endsWith('/farmers')) return 'farmers';
    if (pathname.endsWith('/products')) return 'products';
    if (pathname.endsWith('/orders')) return 'orders';
    if (pathname.endsWith('/categories')) return 'categories';
    if (pathname.endsWith('/deliveries')) return 'deliveries';
    return 'users';
  }, [pathname]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (kind === 'users') setRows(await getUsers());
      if (kind === 'farmers') setRows(await getAllFarmers());
      if (kind === 'products') setRows(await getAllProducts());
      if (kind === 'orders') setRows(await getAllOrdersAdmin());
      if (kind === 'categories') setRows(await getCategories());
      if (kind === 'deliveries') setRows(await getDeliveries());
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [kind]);

  const title = `Manage ${kind[0].toUpperCase()}${kind.slice(1)}`;

  const onDisableUser = async (id) => {
    await disableUser(id);
    load();
  };

  const onAddCategory = async () => {
    if (!categoryName.trim()) return;
    await createCategory({ name: categoryName, description: categoryDescription });
    setCategoryName('');
    setCategoryDescription('');
    load();
  };

  const onEditCategory = async (row) => {
    const name = prompt('Category name', row.name);
    if (!name) return;
    const description = prompt('Category description', row.description || '');
    await updateCategory(row.id, { name, description });
    load();
  };

  const onDeleteCategory = async (id) => {
    if (!confirm('Delete category?')) return;
    await deleteCategory(id);
    load();
  };

  const onAssignDelivery = async (row) => {
    const agentId = Number(prompt('Enter delivery agent user ID'));
    if (!agentId) return;
    await assignDelivery(row.id, agentId);
    load();
  };

  if (loading) return <AppLayout links={links}><LoadingSpinner /></AppLayout>;
  if (error) return <AppLayout links={links}><EmptyState title="Error" subtitle={error} /></AppLayout>;

  let columns = [];
  if (kind === 'users' || kind === 'farmers') {
    columns = [{ key: 'id', title: 'ID' }, { key: 'fullName', title: 'Name' }, { key: 'email', title: 'Email' }, { key: 'role', title: 'Role' }, { key: 'enabled', title: 'Enabled' }, { key: 'actions', title: 'Actions', render: (r) => <button className='text-red-600' onClick={() => onDisableUser(r.id)}>Disable</button> }];
  } else if (kind === 'products') {
    columns = [{ key: 'id', title: 'ID' }, { key: 'name', title: 'Name' }, { key: 'price', title: 'Price' }, { key: 'quantity', title: 'Stock' }, { key: 'categoryId', title: 'Category' }];
  } else if (kind === 'orders') {
    columns = [{ key: 'id', title: 'ID' }, { key: 'status', title: 'Status' }, { key: 'totalAmount', title: 'Total' }, { key: 'createdAt', title: 'Created' }, { key: 'actions', title: 'Assign Agent', render: (r) => <button className='text-farm-green' onClick={() => onAssignDelivery(r)}>Assign</button> }];
  } else if (kind === 'categories') {
    columns = [{ key: 'id', title: 'ID' }, { key: 'name', title: 'Name' }, { key: 'description', title: 'Description' }, { key: 'actions', title: 'Actions', render: (r) => <div className='flex gap-2'><button className='text-farm-green' onClick={() => onEditCategory(r)}>Edit</button><button className='text-red-600' onClick={() => onDeleteCategory(r.id)}>Delete</button></div> }];
  } else if (kind === 'deliveries') {
    columns = [{ key: 'id', title: 'ID' }, { key: 'orderId', title: 'Order' }, { key: 'deliveryAgentId', title: 'Agent ID' }, { key: 'status', title: 'Status' }];
  }

  return <AppLayout links={links}><h1 className='text-xl font-semibold mb-4'>{title}</h1>{kind === 'categories' && <div className='card p-4 mb-4 grid md:grid-cols-3 gap-2'><Input placeholder='Category Name' value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /><Input placeholder='Description' value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} /><Button onClick={onAddCategory}>Add Category</Button></div>}{rows.length ? <DataTable columns={columns} rows={rows} mobileRender={(r) => <div>{JSON.stringify(r)}</div>} /> : <EmptyState title='No records' subtitle='No data available.' />}</AppLayout>;
}

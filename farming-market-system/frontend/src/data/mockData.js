export const categories = [
  { id: 1, name: 'Vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37' },
  { id: 2, name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b' },
  { id: 3, name: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b' },
  { id: 4, name: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b' }
];

export const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: ['Organic Tomatoes', 'Sweet Potatoes', 'Fresh Milk', 'Green Spinach'][i % 4],
  description: 'Freshly harvested from local farms with quality assurance.',
  price: [4.5, 3.2, 2.8, 1.9][i % 4],
  unit: ['kg', 'kg', 'L', 'bunch'][i % 4],
  stock: 10 + i,
  farmer: ['Green Valley', 'Sunrise Farm', 'Mooketsi Dairy', 'Harvest Co-op'][i % 4],
  location: ['Gaborone', 'Francistown', 'Maun', 'Lobatse'][i % 4],
  category: categories[i % 4].name,
  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e'
}));

export const orders = [
  { id: 'ORD-1001', buyer: 'Amina', status: 'PENDING', total: 34.5, items: 3 },
  { id: 'ORD-1002', buyer: 'Kabelo', status: 'PAID', total: 18.2, items: 2 },
  { id: 'ORD-1003', buyer: 'Lerato', status: 'DELIVERING', total: 44.1, items: 6 }
];

export const revenueData = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 190 },
  { name: 'Wed', value: 240 },
  { name: 'Thu', value: 210 },
  { name: 'Fri', value: 310 },
  { name: 'Sat', value: 280 }
];

import { withApiBase } from '../config/api';

const probeTargets = [
  { key: 'auth', path: '/api/auth/login', method: 'GET' },
  { key: 'products', path: '/api/products/public' },
  { key: 'farmers', path: '/api/farmer/dashboard/summary' },
  { key: 'categories', path: '/api/categories' },
  { key: 'dashboard', path: '/api/products' }
];

async function probe({ path, method = 'GET', body }) {
  const response = await fetch(withApiBase(path), {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body
  });
  return { reachable: true, status: response.status };
}

export async function verifyBackendConnectivity() {
  const checks = await Promise.allSettled(
    probeTargets.map(async (target) => ({ key: target.key, ...(await probe(target)) }))
  );

  return checks.reduce((acc, result, index) => {
    if (result.status === 'fulfilled') {
      acc[result.value.key] = result.value;
      return acc;
    }
    const failedKey = probeTargets[index].key;
    acc[failedKey] = { reachable: false, status: null };
    return acc;
  }, {});
}

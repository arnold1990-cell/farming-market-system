import api from './api';

const probeTargets = [
  { key: 'products', path: '/api/products' },
  { key: 'categories', path: '/api/categories' },
  { key: 'farmers', path: '/api/farmers' }
];

async function probe({ path, method = 'GET', body }) {
  const response = await api.request({
    url: path,
    method,
    data: body,
    headers: body ? { 'Content-Type': 'application/json' } : undefined
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

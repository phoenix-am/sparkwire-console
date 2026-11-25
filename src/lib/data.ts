/** Sample data for the console. Sized and shaped like a small real team's. */
export type Status = 'live' | 'building' | 'failed' | 'paused';
export interface Service {
  id: string;
  name: string;
  owner: string;
  region: string;
  status: Status;
  cost: number;
  uptime: number;
  lastDeploy: Date;
}

const owners = ['Asha Patel', 'Rohan Shah', 'Meera Joshi', 'Kabir Singh', 'Anmol Mehta', 'Priya Nair', 'Vikram Rao'];
const regions = ['ap-south-1', 'ap-southeast-1', 'eu-west-1', 'us-east-1'];
const names = ['api-gateway', 'payments', 'search', 'notifications', 'reports', 'auth', 'billing', 'media', 'analytics', 'inventory', 'orders', 'catalog', 'checkout', 'emails', 'webhooks', 'scheduler', 'pricing', 'recommendations', 'support', 'ledger'];
const statuses: Status[] = ['live', 'live', 'live', 'building', 'live', 'failed', 'live', 'paused'];

/** Deterministic, so tests and screenshots are stable. */
const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const r = rand(42);
const now = new Date(2026, 10, 25, 18, 0);

export const services: Service[] = names.map((name, i) => ({
  id: `svc-${i + 1}`,
  name,
  owner: owners[i % owners.length],
  region: regions[i % regions.length],
  status: statuses[i % statuses.length],
  cost: Math.round(2000 + r() * 28000),
  uptime: Math.round((99 + r()) * 100) / 100,
  lastDeploy: new Date(now.getTime() - Math.round(r() * 14 * 24) * 3600_000),
}));

export const traffic = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(now.getTime() - (13 - i) * 24 * 3600_000);
  return {
    day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    requests: Math.round(80 + r() * 40 + i * 3),
    errors: Math.round(1 + r() * 4),
  };
});

export const regionsList = regions;
export const ownersList = owners;

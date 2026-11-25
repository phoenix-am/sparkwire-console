import { Badge, BarChart, Card, DonutChart, LineChart, Progress } from '@sparkwire/core';
import { services, traffic } from '../lib/data';
import { useMoney } from '../lib/settings';

export function Overview() {
  const money = useMoney();
  const live = services.filter((s) => s.status === 'live').length;
  const failed = services.filter((s) => s.status === 'failed').length;
  const spend = services.reduce((n, s) => n + s.cost, 0);
  const uptime = services.reduce((n, s) => n + s.uptime, 0) / services.length;
  const byStatus = (['live', 'building', 'paused', 'failed'] as const).map((st) => ({ label: st[0].toUpperCase() + st.slice(1), value: services.filter((s) => s.status === st).length }));
  const topCost = [...services].sort((a, b) => b.cost - a.cost).slice(0, 6).map((s) => ({ name: s.name, cost: s.cost }));

  return (
    <>
      <div className="page-head">
        <h1>Overview</h1>
        <p>Everything running across four regions.</p>
      </div>
      <section className="kpis" aria-label="Key numbers">
        <Card>
          <p className="kpi__label">Services live</p>
          <p className="kpi__value">
            {live} <span>of {services.length}</span>
          </p>
        </Card>
        <Card>
          <p className="kpi__label">Failing</p>
          <p className="kpi__value">
            {failed} {failed > 0 && <Badge tone="error" variant="soft" led>Needs attention</Badge>}
          </p>
        </Card>
        <Card>
          <p className="kpi__label">Monthly spend</p>
          <p className="kpi__value">{money(spend)}</p>
        </Card>
        <Card>
          <p className="kpi__label">Average uptime</p>
          <Progress label={`${uptime.toFixed(2)}%`} value={uptime} />
        </Card>
      </section>
      <section className="charts">
        <Card className="chart-wide">
          <LineChart title="Requests per day (thousands)" data={traffic} x="day" series={[{ key: 'requests', label: 'Requests' }, { key: 'errors', label: 'Errors' }]} />
        </Card>
        <Card>
          <DonutChart title="Services by status" data={byStatus} />
        </Card>
        <Card className="chart-wide">
          <BarChart title="Most expensive services (₹ / month)" data={topCost} x="name" series={[{ key: 'cost', label: 'Cost' }]} />
        </Card>
      </section>
    </>
  );
}

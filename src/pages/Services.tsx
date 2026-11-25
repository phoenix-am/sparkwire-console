import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Badge, Button, DataTable, Modal, useToast } from '@sparkwire/core';
import { services as initial, type Service, type Status } from '../lib/data';
import { useMoney, useSettings } from '../lib/settings';

const TONE: Record<Status, 'success' | 'warning' | 'error' | 'neutral'> = { live: 'success', building: 'warning', failed: 'error', paused: 'neutral' };

export function Services() {
  const money = useMoney();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Service[]>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<Service[] | null>(null);
  const when = useMemo(() => new Intl.DateTimeFormat(settings.locale, { dateStyle: 'medium', timeStyle: 'short' }), [settings.locale]);

  const pause = (list: Service[]) => {
    const ids = new Set(list.map((s) => s.id));
    const before = rows;
    setRows((r) => r.map((s) => (ids.has(s.id) ? { ...s, status: 'paused' } : s)));
    setSelected(new Set());
    setConfirm(null);
    toast({
      title: list.length === 1 ? `Paused ${list[0].name}` : `Paused ${list.length} services`,
      tone: 'success',
      action: { label: 'Undo', onClick: () => setRows(before) },
    });
  };

  return (
    <>
      <div className="page-head">
        <h1>Services</h1>
        <p>Search, sort and pause what's running.</p>
      </div>
      <DataTable<Service>
        aria-label="Services"
        searchable
        data={rows}
        getRowKey={(s) => s.id}
        defaultSearch={params.get('q') ?? ''}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={(keys) => setSelected(new Set([...keys].map(String)))}
        bulkActions={(list) => (
          <Button size="small" variant="outlined" color="warning" onClick={() => setConfirm(list)}>
            Pause {list.length}
          </Button>
        )}
        defaultPageSize={10}
        columns={[
          { key: 'name', header: 'Service', sortable: true },
          { key: 'owner', header: 'Owner', sortable: true },
          { key: 'region', header: 'Region', sortable: true },
          { key: 'status', header: 'Status', sortable: true, cell: (s) => <Badge tone={TONE[s.status]} variant="soft" led>{s.status}</Badge> },
          { key: 'cost', header: 'Monthly cost', sortable: true, align: 'end', cell: (s) => money(s.cost) },
          { key: 'lastDeploy', header: 'Last deploy', sortable: true, cell: (s) => when.format(s.lastDeploy) },
        ]}
      />
      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm && confirm.length === 1 ? `Pause ${confirm[0].name}?` : `Pause ${confirm?.length ?? 0} services?`}
        description="Traffic to paused services is turned away until you resume them."
        actions={
          <>
            <Button variant="text" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button color="warning" onClick={() => confirm && pause(confirm)}>
              Pause
            </Button>
          </>
        }
      />
    </>
  );
}

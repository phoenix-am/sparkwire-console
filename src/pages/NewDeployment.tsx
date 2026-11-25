import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, Combobox, DatePicker, Dropdown, NumberField, Switch, Textarea, Textfield, TimePicker, useToast } from '@sparkwire/core';
import { ownersList, regionsList, services } from '../lib/data';

interface Form {
  service: string | null;
  version: string;
  region: string | null;
  owner: string | null;
  replicas: number;
  date: Date | null;
  canary: boolean;
  notes: string;
}
const empty: Form = { service: null, version: '', region: null, owner: null, replicas: 2, date: null, canary: true, notes: '' };

export function NewDeployment() {
  const [form, setForm] = useState<Form>(empty);
  const [tried, setTried] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const errors = {
    service: !form.service && 'Pick a service.',
    version: !/^v?\d+\.\d+\.\d+$/.test(form.version.trim()) && 'Use a version like 1.4.2.',
    region: !form.region && 'Pick a region.',
  };
  const valid = !Object.values(errors).some(Boolean);

  return (
    <>
      <div className="page-head">
        <h1>New deployment</h1>
        <p>Ship a version of a service to a region.</p>
      </div>
      <Card className="form-card">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!valid) return;
            toast({ title: `Deploying ${form.service} ${form.version}`, description: `${form.replicas} replicas in ${form.region}${form.canary ? ', canary first' : ''}.`, tone: 'success' });
            setForm(empty);
            setTried(false);
            navigate('/services');
          }}
        >
          <div className="form-grid">
            <Combobox
              label="Service"
              options={services.map((s) => ({ value: s.name, label: s.name }))}
              value={form.service}
              onChange={(v) => set('service', v as string | null)}
              error={tried && !!errors.service}
              helperText={tried ? errors.service || undefined : undefined}
            />
            <Textfield label="Version" placeholder="1.4.2" value={form.version} onChange={(e) => set('version', e.target.value)} error={tried && !!errors.version} helperText={tried ? errors.version || undefined : undefined} />
            <Dropdown label="Region" placeholder="Choose a region" options={regionsList.map((r) => ({ value: r, label: r }))} value={form.region} onChange={(v) => set('region', v as string)} error={tried && !!errors.region} helperText={tried ? errors.region || undefined : undefined} />
            <Dropdown label="Owner" placeholder="Who is on call" options={ownersList.map((o) => ({ value: o, label: o }))} value={form.owner} onChange={(v) => set('owner', v as string)} />
            <NumberField label="Replicas" min={1} max={50} value={form.replicas} onChange={(v) => set('replicas', Number.isFinite(v) ? v : 1)} />
            <DatePicker label="Deploy on" value={form.date} onChange={(d) => set('date', d)} helperText="Leave empty to deploy now." />
            <TimePicker label="At" />
            <Switch label="Canary first" checked={form.canary} onChange={(checked) => set("canary", checked)} />
          </div>
          <Textarea label="Notes for the team" value={form.notes} onChange={(v) => set("notes", v)} rows={3} />
          <div className="form-actions">
            <Button type="button" variant="text" onClick={() => (setForm(empty), setTried(false))}>
              Reset
            </Button>
            <Button type="submit">Deploy</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, Combobox, DatePicker, Dropdown, NumberField, Stepper, Switch, Textarea, Textfield, TimePicker, useToast } from '@sparkwire/core';
import { ownersList, regionsList, services } from '../lib/data';

interface Form {
  service: string | null;
  version: string;
  region: string | null;
  owner: string | null;
  replicas: number;
  date: Date | null;
  time: string | null;
  canary: boolean;
  notes: string;
}
const empty: Form = { service: null, version: '', region: null, owner: null, replicas: 2, date: null, time: null, canary: true, notes: '' };

const STEPS = [
  { label: 'What', description: 'Service and version' },
  { label: 'Where', description: 'Region and size' },
  { label: 'Review', description: 'When, notes, deploy' },
];

export function NewDeployment() {
  const [form, setForm] = useState<Form>(empty);
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState<boolean[]>([false, false, false]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const errors = [
    {
      service: !form.service && 'Pick a service.',
      version: !/^v?\d+\.\d+\.\d+$/.test(form.version.trim()) && 'Use a version like 1.4.2.',
    },
    { region: !form.region && 'Pick a region.' },
    {},
  ] as Record<string, string | false>[];
  const stepValid = (i: number) => !Object.values(errors[i]).some(Boolean);
  const show = (i: number, k: string) => (tried[i] ? errors[i][k] || undefined : undefined);

  const goTo = (i: number) => {
    setStep(i);
    // Move focus to the new step's heading so keyboard and screen reader users land in it.
    requestAnimationFrame(() => heading.current?.focus());
  };
  const next = () => {
    setTried((t) => t.map((v, i) => (i === step ? true : v)));
    if (stepValid(step)) goTo(step + 1);
  };
  const reset = () => {
    setForm(empty);
    setTried([false, false, false]);
    goTo(0);
  };

  return (
    <>
      <div className="page-head">
        <h1>New deployment</h1>
        <p>Ship a version of a service to a region.</p>
      </div>
      <Card className="form-card">
        <Stepper
          steps={STEPS.map((s, i) => ({ ...s, error: tried[i] && !stepValid(i) }))}
          active={step}
          onStepClick={goTo}
        />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < STEPS.length - 1) return next();
            const bad = [0, 1].find((i) => !stepValid(i));
            if (bad !== undefined) {
              setTried([true, true, true]);
              return goTo(bad);
            }
            toast({ title: `Deploying ${form.service} ${form.version}`, description: `${form.replicas} replicas in ${form.region}${form.canary ? ', canary first' : ''}.`, tone: 'success' });
            reset();
            navigate('/services');
          }}
        >
          <h2 ref={heading} tabIndex={-1} className="step-title">
            {STEPS[step].label}: {STEPS[step].description.toLowerCase()}
          </h2>
          {step === 0 && (
            <div className="form-grid">
              <Combobox
                label="Service"
                options={services.map((s) => ({ value: s.name, label: s.name }))}
                value={form.service}
                onChange={(v) => set('service', v as string | null)}
                error={!!show(0, 'service')}
                helperText={show(0, 'service')}
              />
              <Textfield label="Version" placeholder="1.4.2" value={form.version} onValueChange={(v) => set('version', v)} error={!!show(0, 'version')} helperText={show(0, 'version')} />
            </div>
          )}
          {step === 1 && (
            <div className="form-grid">
              <Dropdown label="Region" placeholder="Choose a region" options={regionsList.map((r) => ({ value: r, label: r }))} value={form.region} onChange={(v) => set('region', v as string)} error={!!show(1, 'region')} helperText={show(1, 'region')} />
              <Dropdown label="Owner" placeholder="Who is on call" options={ownersList.map((o) => ({ value: o, label: o }))} value={form.owner} onChange={(v) => set('owner', v as string)} />
              <NumberField label="Replicas" min={1} max={50} value={form.replicas} onChange={(v) => set('replicas', Number.isFinite(v) ? v : 1)} />
              <Switch label="Canary first" checked={form.canary} onChange={(checked) => set('canary', checked)} />
            </div>
          )}
          {step === 2 && (
            <>
              <dl className="summary">
                <dt>Service</dt>
                <dd>{form.service} {form.version}</dd>
                <dt>Region</dt>
                <dd>{form.region}{form.owner ? `, on call: ${form.owner}` : ''}</dd>
                <dt>Size</dt>
                <dd>{form.replicas} replicas{form.canary ? ', canary first' : ''}</dd>
              </dl>
              <div className="form-grid">
                <DatePicker label="Deploy on" value={form.date} onChange={(d) => set('date', d)} helperText="Leave empty to deploy now." />
                <TimePicker label="At" value={form.time} onChange={(t) => set('time', t)} />
              </div>
              <Textarea label="Notes for the team" value={form.notes} onChange={(v) => set('notes', v)} rows={3} />
            </>
          )}
          <div className="form-actions">
            <Button type="button" variant="text" onClick={reset}>
              Reset
            </Button>
            {step > 0 && (
              <Button type="button" variant="outlined" onClick={() => goTo(step - 1)}>
                Back
              </Button>
            )}
            <Button type="submit">{step < STEPS.length - 1 ? 'Continue' : 'Deploy'}</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

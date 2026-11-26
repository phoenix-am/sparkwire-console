import { useState } from 'react';
import { Button, FileUpload, Switch, Tabs, TabList, Tab, TabPanel, Textfield, ToggleGroup, ToggleGroupItem, useToast } from '@sparkwire/core';
import { useSettings, type Energy } from '../lib/settings';

/** Team settings: profile, alerts and config import. */
export function Settings() {
  const { toast } = useToast();
  const { settings, set } = useSettings();
  const [team, setTeam] = useState('Platform');
  const [slack, setSlack] = useState('#deploys');
  const [alerts, setAlerts] = useState({ failed: true, paused: false, daily: true });
  const teamError = team.trim() === '' ? 'Give the team a name.' : undefined;

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Team details, alerts and config.</p>
      </div>
      <Tabs defaultValue="team">
        <TabList aria-label="Settings">
          <Tab value="team">Team</Tab>
          <Tab value="alerts">Alerts</Tab>
          <Tab value="import">Import</Tab>
          <Tab value="appearance">Appearance</Tab>
        </TabList>
        <TabPanel value="team">
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!teamError) toast({ title: 'Team saved', tone: 'success' });
            }}
          >
            <Textfield label="Team name" size="small" value={team} onValueChange={setTeam} error={!!teamError} helperText={teamError} />
            <Textfield label="Slack channel" size="small" value={slack} onValueChange={setSlack} helperText="Deploy news is posted here." />
            <div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </TabPanel>
        <TabPanel value="alerts">
          <div className="form">
            <Switch label="When a deploy fails" checked={alerts.failed} onChange={(v) => setAlerts((a) => ({ ...a, failed: v }))} />
            <Switch label="When a service is paused" checked={alerts.paused} onChange={(v) => setAlerts((a) => ({ ...a, paused: v }))} />
            <Switch label="Daily summary at 9 am" checked={alerts.daily} onChange={(v) => setAlerts((a) => ({ ...a, daily: v }))} />
          </div>
        </TabPanel>
        <TabPanel value="import">
          <div className="form">
            <FileUpload
              label="Service config"
              accept=".json,.yaml,.yml"
              multiple={false}
              maxSize={1024 * 1024}
              helperText="JSON or YAML, up to 1 MB"
              onChange={(files) => {
                if (files.length) toast({ title: `Read ${files[0].file.name}`, tone: 'success' });
              }}
            />
          </div>
        </TabPanel>
        <TabPanel value="appearance">
          <div className="form">
            <div>
              <p className="field-label" id="energy-label">Energy</p>
              <ToggleGroup aria-labelledby="energy-label" fullWidth value={settings.energy} onChange={(v) => v && set({ energy: v as Energy })}>
                <ToggleGroupItem value="off">Off</ToggleGroupItem>
                <ToggleGroupItem value="calm">Calm</ToggleGroupItem>
                <ToggleGroupItem value="default">Default</ToggleGroupItem>
                <ToggleGroupItem value="electric">Electric</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Switch label="Light mode" checked={settings.mode === 'light'} onChange={(on) => set({ mode: on ? 'light' : 'dark' })} />
          </div>
        </TabPanel>
      </Tabs>
    </>
  );
}

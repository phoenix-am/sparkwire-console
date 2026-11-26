import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { Button, CommandPalette, Sidebar, SparkProvider, ToastProvider, ToggleGroup, ToggleGroupItem, Dropdown, Tooltip } from '@sparkwire/core';
import { ThemeProvider } from '@sparkwire/system';
import { SettingsProvider, useSettings, type Energy } from './lib/settings';
import { Overview } from './pages/Overview';
import { Services } from './pages/Services';
import { NewDeployment } from './pages/NewDeployment';
import { Settings } from './pages/Settings';
import { services } from './lib/data';

const Icon = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const icons = {
  overview: 'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z',
  services: 'M4 6h16M4 12h16M4 18h16',
  deploy: 'M12 2 4 14h7l-1 8 9-12h-7z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
};

export function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}

const LOCALES = [
  { value: 'en-IN', label: 'English' },
  { value: 'hi-IN', label: 'हिन्दी' },
  { value: 'gu-IN', label: 'ગુજરાતી' },
  { value: 'ta-IN', label: 'தமிழ்' },
];

function Shell() {
  const { settings, set } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = pathname.startsWith('/services') ? 'services' : pathname.startsWith('/deploy') ? 'deploy' : pathname.startsWith('/settings') ? 'settings' : 'overview';

  useEffect(() => {
    document.documentElement.lang = settings.locale;
  }, [settings.locale]);

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <ThemeProvider mode={settings.mode} global>
      <SparkProvider energy={settings.energy} locale={settings.locale}>
        <ToastProvider>
          <div className="app">
            <Sidebar
              aria-label="Console"
              value={active}
              mobileOpen={menuOpen}
              onMobileOpenChange={setMenuOpen}
              header={(collapsed) => <span className="brand">{collapsed ? 'SW' : 'Sparkwire Console'}</span>}
              items={[
                { id: 'overview', label: 'Overview', icon: <Icon d={icons.overview} />, onSelect: () => go('/') },
                { id: 'services', label: 'Services', icon: <Icon d={icons.services} />, badge: services.filter((s) => s.status === 'failed').length || undefined, onSelect: () => go('/services') },
                { id: 'deploy', label: 'New deployment', icon: <Icon d={icons.deploy} />, onSelect: () => go('/deploy') },
                { id: 'settings', label: 'Settings', icon: <Icon d={icons.settings} />, onSelect: () => go('/settings') },
              ]}
            />
            <div className="main">
              <header className="topbar">
                <Button variant="text" className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                  <Icon d="M4 6h16M4 12h16M4 18h16" />
                </Button>
                <Button variant="outlined" size="small" onClick={() => setSearchOpen(true)}>
                  Search<span className="wide-only"> services</span>
                </Button>
                <div className="topbar__end">
                  <ToggleGroup aria-label="Energy" size="small" className="energy-switch" value={settings.energy} onChange={(v) => v && set({ energy: v as Energy })}>
                    <ToggleGroupItem value="off">Off</ToggleGroupItem>
                    <ToggleGroupItem value="calm">Calm</ToggleGroupItem>
                    <ToggleGroupItem value="default">Default</ToggleGroupItem>
                    <ToggleGroupItem value="electric">Electric</ToggleGroupItem>
                  </ToggleGroup>
                  <Dropdown size="small" aria-label="Language" value={settings.locale} onChange={(v) => set({ locale: String(v) })} options={LOCALES} />
                  <Tooltip title={settings.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                    <Button variant="text" size="small" aria-label={settings.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => set({ mode: settings.mode === 'dark' ? 'light' : 'dark' })}>
                      {settings.mode === 'dark' ? '☀' : '☾'}
                    </Button>
                  </Tooltip>
                </div>
              </header>
              <main className="content" id="content">
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path="services" element={<Services />} />
                  <Route path="deploy" element={<NewDeployment />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
          <CommandPalette
            aria-label="Search services"
            placeholder="Search services and pages…"
            open={searchOpen}
            onOpenChange={setSearchOpen}
            items={[
              { heading: 'Pages', items: [
                { id: 'p-overview', label: 'Overview', onSelect: () => go('/') },
                { id: 'p-services', label: 'Services', onSelect: () => go('/services') },
                { id: 'p-deploy', label: 'New deployment', onSelect: () => go('/deploy') },
                { id: 'p-settings', label: 'Settings', onSelect: () => go('/settings') },
              ] },
              { heading: 'Services', items: services.map((s) => ({ id: s.id, label: s.name, description: `${s.owner} · ${s.region}`, onSelect: () => go(`/services?q=${encodeURIComponent(s.name)}`) })) },
            ]}
          />
        </ToastProvider>
      </SparkProvider>
    </ThemeProvider>
  );
}

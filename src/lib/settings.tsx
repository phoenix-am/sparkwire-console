import React, { createContext, useContext, useEffect, useState } from 'react';

export type Energy = 'off' | 'calm' | 'default' | 'electric';
export type Mode = 'dark' | 'light';
export interface Settings {
  mode: Mode;
  energy: Energy;
  locale: string;
}
const KEY = 'sparkwire-console:settings';
const defaults: Settings = { mode: 'dark', energy: 'default', locale: 'en-IN' };

function load(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}

const Ctx = createContext<{ settings: Settings; set: (s: Partial<Settings>) => void }>({ settings: defaults, set: () => {} });

/** App-wide preferences, kept between visits. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* private mode */
    }
  }, [settings]);
  return <Ctx.Provider value={{ settings, set: (s) => setSettings((x) => ({ ...x, ...s })) }}>{children}</Ctx.Provider>;
}
export const useSettings = () => useContext(Ctx);

/** Money in rupees, in the user's locale. */
export const useMoney = () => {
  const { settings } = useSettings();
  const f = new Intl.NumberFormat(settings.locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  return (n: number) => f.format(n);
};

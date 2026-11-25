import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const axe = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(
    violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} — ${n.failureSummary?.split('\n').pop()?.trim()}`)),
  ).toEqual([]);
};

for (const [name, path, heading] of [
  ['Overview', '/', 'Overview'],
  ['Services', '/services', 'Services'],
  ['New deployment', '/deploy', 'New deployment'],
] as const) {
  test(`${name} has no accessibility violations, dark and light`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await axe(page);
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    // Colours fade between themes; check the settled colours, not a frame mid-fade.
    await page.waitForFunction(() => document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
    await axe(page);
  });
}

test('Theme switches both ways without axe running', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-spark-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-spark-theme', 'dark');
});

test('Search jumps to a service, filtered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search services' }).click();
  await page.getByRole('combobox').pressSequentially('payme');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/services\?q=payments/);
  await expect(page.locator('.sp-data-table__body [role=row]')).toHaveCount(1);
});

test('Pause two services, then undo', async ({ page }) => {
  await page.goto('/services');
  const rows = page.locator('.sp-data-table__body [role=row]');
  await rows.nth(0).getByRole('checkbox').check({ force: true });
  await rows.nth(1).getByRole('checkbox').check({ force: true });
  await page.getByRole('button', { name: 'Pause 2' }).click();
  const dialog = page.getByRole('dialog', { name: 'Pause 2 services?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(rows.nth(0)).toContainText('paused');
  await expect(rows.nth(1)).toContainText('paused');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(rows.nth(0)).toContainText('live');
  await expect(rows.nth(1)).toContainText('live');
});

test('Deployment form explains what is missing, then deploys', async ({ page }) => {
  await page.goto('/deploy');
  await page.getByRole('button', { name: 'Deploy', exact: true }).click();
  await expect(page.getByText('Pick a service.')).toBeVisible();
  await expect(page.getByText('Use a version like 1.4.2.')).toBeVisible();
  await expect(page.getByText('Pick a region.')).toBeVisible();

  // Pick from the lists by keyboard. (Clicking works too, but Playwright may scroll the page
  // to reach an option, and an open list closes when the page scrolls, by design.)
  const service = page.getByRole('combobox', { name: 'Service' });
  await service.click();
  await service.pressSequentially('payme');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(service).toHaveValue('payments');
  await page.getByRole('textbox', { name: 'Version' }).fill('2.1.0');
  const region = page.getByRole('button', { name: /Region/ });
  await region.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
  await page.keyboard.type('eu');
  await page.keyboard.press('Enter');
  await expect(region).toContainText('eu-west-1');
  await page.getByRole('button', { name: 'Deploy', exact: true }).click();

  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByText('Deploying payments 2.1.0')).toBeVisible();
});

test('Reset clears a typed field (controlled Textfield)', async ({ page }) => {
  await page.goto('/deploy');
  const version = page.getByRole('textbox', { name: 'Version' });
  await version.fill('9.9.9');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(version).toHaveValue('');
});

test('Language and energy are remembered after a reload', async ({ page }) => {
  await page.goto('/services');
  await page.getByRole('radio', { name: 'Calm' }).or(page.getByRole('button', { name: 'Calm' })).first().click();
  await page.getByRole('button', { name: /Language/ }).click();
  await page.getByRole('option', { name: 'हिन्दी' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi-IN');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi-IN');
  await expect(page.locator('.sp-energy[data-spark-energy="calm"]')).toBeAttached();
  // Built-in text follows the language.
  await expect(page.getByRole('searchbox')).toHaveAttribute('placeholder', /खोज/);
});

test('@mobile phone: the menu opens the navigation and moves between pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('link', { name: 'Services' }).or(page.getByRole('button', { name: /^Services/ })).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Services' })).toBeVisible();
});

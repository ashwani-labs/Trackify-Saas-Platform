/**
 * Captures real application screenshots for the README.
 * Prerequisites: backend (8080), master-app (5173), tenant-app (5174) running.
 *
 * Usage: node scripts/capture-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots');

const MASTER_URL = process.env.MASTER_URL || 'http://localhost:5173';
const TENANT_URL = process.env.TENANT_URL || 'http://localhost:5174';
const MASTER_EMAIL = process.env.MASTER_EMAIL || 'master@trackify.com';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'admin123';
const TENANT_EMAIL = process.env.TENANT_EMAIL || '';
const TENANT_PASSWORD = process.env.TENANT_PASSWORD || 'admin123';
const API_URL = process.env.API_URL || 'http://localhost:8080';
const SCREENSHOT_TENANT_CODE = process.env.SCREENSHOT_TENANT_CODE || 'readmedemo';
const SCREENSHOT_ADMIN_EMAIL =
  process.env.SCREENSHOT_ADMIN_EMAIL || 'readme-demo@trackify.local';

fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name, options = {}) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, ...options });
  console.log(`Saved ${file}`);
}

async function loginMaster(page) {
  await page.goto(`${MASTER_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('#login-email', MASTER_EMAIL);
  await page.fill('#login-password', MASTER_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 20000 });
  await page.waitForTimeout(800);
}

async function discoverTenantDomains(page) {
  await page.goto(`${MASTER_URL}/dashboard/tenants`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const codes = await page.locator('.domain-code').allTextContents();
  return codes
    .map((code) => code.replace('.trackify.io', '').trim())
    .filter(Boolean);
}

function adminEmailCandidates(domain) {
  return [
    TENANT_EMAIL,
    `admin@${domain}.com`,
    `admin@${domain}.io`,
    `admin@${domain}.trackify.io`,
  ].filter(Boolean);
}

async function getMasterToken(page) {
  return page.evaluate(() => localStorage.getItem('trackify_master_token'));
}

async function ensureScreenshotTenant(page, { recreate = false } = {}) {
  const token = await getMasterToken(page);
  if (!token) return false;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const listRes = await page.request.get(`${API_URL}/tenants?size=100`, { headers });
  if (!listRes.ok()) {
    console.warn('Could not list tenants for screenshot provisioning');
    return false;
  }

  const listBody = await listRes.json();
  const tenants = listBody?.data?.content ?? listBody?.data ?? [];
  const existing = tenants.find((tenant) => tenant.domain === SCREENSHOT_TENANT_CODE);

  if (existing && recreate) {
    if (existing.status !== 'INACTIVE') {
      await page.request.patch(`${API_URL}/tenants/${existing.id}/status`, {
        headers,
        data: { status: 'INACTIVE' },
      });
    }
    await page.request.delete(`${API_URL}/tenants/${existing.id}`, { headers });
    await page.waitForTimeout(1500);
  } else if (existing) {
    return true;
  }

  console.log(`Provisioning screenshot tenant "${SCREENSHOT_TENANT_CODE}"…`);
  const createRes = await page.request.post(`${API_URL}/tenants`, {
    headers,
    data: {
      name: 'README Demo',
      code: SCREENSHOT_TENANT_CODE,
      adminEmail: SCREENSHOT_ADMIN_EMAIL,
      plan: 'FREE',
      companyName: 'README Demo Co',
      theme: 'violet',
    },
  });

  if (!createRes.ok()) {
    console.warn('Screenshot tenant provisioning failed:', await createRes.text());
    return false;
  }

  console.log(
    'Screenshot tenant ready. Set TRACKIFY_DEV_FIXED_ADMIN_PASSWORD=admin123 on tenant-service for a known login password.'
  );
  await page.waitForTimeout(2500);
  return true;
}

function buildLoginDomains(tenantDomains) {
  const domains = [...tenantDomains];
  if (!domains.includes(SCREENSHOT_TENANT_CODE)) {
    domains.unshift(SCREENSHOT_TENANT_CODE);
  }
  return domains;
}

function buildLoginCandidates(domains) {
  const fromDomains = domains.flatMap(adminEmailCandidates);
  if (domains.includes(SCREENSHOT_TENANT_CODE)) {
    fromDomains.unshift(SCREENSHOT_ADMIN_EMAIL);
  }
  return [...new Set(fromDomains)];
}

async function tryTenantLogin(context, domains) {
  const candidates = buildLoginCandidates(domains);

  for (const email of candidates) {
    const tenantPage = await context.newPage();
    try {
      await tenantPage.goto(`${TENANT_URL}/login`, { waitUntil: 'networkidle' });
      await tenantPage.fill('#email', email);
      await tenantPage.fill('#password', TENANT_PASSWORD);
      await tenantPage.getByRole('button', { name: /log in/i }).click();
      await tenantPage.waitForURL('**/dashboard**', { timeout: 8000 });
      console.log(`Tenant login succeeded for ${email}`);
      return tenantPage;
    } catch {
      await tenantPage.close();
    }
  }
  return null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Public pages
  await page.goto(TENANT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await shot(page, 'tenant-landing');

  await page.goto(`${MASTER_URL}/login`, { waitUntil: 'networkidle' });
  await shot(page, 'master-login');

  // Master authenticated
  let tenantDomains = [];
  try {
    await loginMaster(page);
    await shot(page, 'master-dashboard');

    tenantDomains = await discoverTenantDomains(page);
    await shot(page, 'master-tenants');
  } catch (err) {
    console.warn('Master authenticated screenshots skipped:', err.message);
  }

  // Tenant authenticated
  let screenshotReady = false;
  if (page.url().includes('dashboard')) {
    screenshotReady = await ensureScreenshotTenant(page);
    if (screenshotReady) {
      tenantDomains = buildLoginDomains(tenantDomains);
    }
  }

  let tenantPage =
    tenantDomains.length > 0
      ? await tryTenantLogin(context, tenantDomains)
      : TENANT_EMAIL
        ? await tryTenantLogin(context, ['workspace'])
        : null;

  if (!tenantPage && screenshotReady && process.env.SCREENSHOT_RECREATE === '1') {
    screenshotReady = await ensureScreenshotTenant(page, { recreate: true });
    if (screenshotReady) {
      tenantPage = await tryTenantLogin(context, buildLoginDomains(tenantDomains));
    }
  }

  if (tenantPage) {
    try {
      await shot(tenantPage, 'tenant-dashboard');

      await tenantPage.goto(`${TENANT_URL}/projects`, { waitUntil: 'networkidle' });
      await tenantPage.waitForTimeout(800);
      await shot(tenantPage, 'tenant-projects');

      const projectLink = tenantPage
        .locator('a[href*="/projects/"], .project-card, [class*="project-card"]')
        .first();
      if (await projectLink.count()) {
        await projectLink.click();
        await tenantPage.waitForTimeout(1200);
        await shot(tenantPage, 'tenant-kanban');
      }

      await tenantPage.goto(`${TENANT_URL}/workspace-settings`, { waitUntil: 'networkidle' });
      await tenantPage.waitForTimeout(800);
      await shot(tenantPage, 'tenant-workspace-settings');
    } catch (err) {
      console.warn('Tenant authenticated screenshots skipped:', err.message);
    }
    await tenantPage.close();
  } else {
    await page.goto(`${TENANT_URL}/login`, { waitUntil: 'networkidle' });
    await shot(page, 'tenant-login');
    console.log(
      'Tenant dashboard screenshots skipped — set TENANT_EMAIL/TENANT_PASSWORD, or restart tenant-service with TRACKIFY_DEV_FIXED_ADMIN_PASSWORD=admin123 and re-run.'
    );
  }

  await browser.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

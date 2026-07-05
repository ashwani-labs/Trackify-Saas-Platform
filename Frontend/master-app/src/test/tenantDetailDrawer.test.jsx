import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TenantDetailDrawer from '../components/tenants/TenantDetailDrawer';
import tenantReducer, {
  loadTenantDetail,
  clearSelectedTenant,
} from '../features/tenants/tenantSlice';

const mockTenantDetail = {
  id: 1,
  name: 'Acme Corp',
  domain: 'acme',
  plan: 'PRO',
  status: 'ACTIVE',
  createdAt: '2026-01-15T10:00:00',
  updatedAt: '2026-03-01T12:00:00',
  companyName: 'Acme Corporation',
  logoUrl: 'https://example.com/logo.png',
  primaryColor: '#2563eb',
  dbName: 'trackify_acme',
  dbHost: 'localhost',
  dbPort: 5432,
  totalUsers: 12,
  activeUsers: 10,
  pendingUsers: 2,
};

vi.mock('../services/tenantApi', () => ({
  fetchTenantById: vi.fn(() => Promise.resolve({ data: mockTenantDetail })),
}));

function renderDrawer({ onToggleStatus = vi.fn(), onDelete = vi.fn() } = {}) {
  const store = configureStore({
    reducer: { tenants: tenantReducer },
  });

  store.dispatch(loadTenantDetail(1));

  const view = render(
    <Provider store={store}>
      <TenantDetailDrawer onToggleStatus={onToggleStatus} onDelete={onDelete} />
    </Provider>
  );

  return { store, onToggleStatus, onDelete, ...view };
}

describe('TenantDetailDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tenant overview, branding, infrastructure, and usage sections', async () => {
    renderDrawer();

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /acme corp/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('acme.trackify.io')).toBeInTheDocument();
    expect(screen.getByText('trackify_acme')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderDrawer();

    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /close tenant details/i }));

    expect(store.getState().tenants.detailTenantId).toBeNull();
    expect(store.getState().tenants.selectedTenant).toBeNull();
  });

  it('shows workspace URL with external link', async () => {
    renderDrawer();

    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());

    const workspaceLink = screen.getByRole('link', { name: /acme\.trackify\.io/i });
    expect(workspaceLink).toHaveAttribute('href', 'https://acme.trackify.io');
    expect(screen.getByRole('button', { name: /copy workspace url/i })).toBeInTheDocument();
  });

  it('calls onToggleStatus from footer action', async () => {
    const user = userEvent.setup();
    const onToggleStatus = vi.fn();
    renderDrawer({ onToggleStatus });

    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /suspend organization/i }));

    expect(onToggleStatus).toHaveBeenCalledWith(1, 'ACTIVE', 'Acme Corp');
  });

  it('does not render when no tenant is selected', () => {
    const store = configureStore({
      reducer: { tenants: tenantReducer },
    });

    render(
      <Provider store={store}>
        <TenantDetailDrawer onToggleStatus={vi.fn()} onDelete={vi.fn()} />
      </Provider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    store.dispatch(clearSelectedTenant());
  });
});

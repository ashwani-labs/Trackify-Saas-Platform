import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CreateTenantModal from '../components/tenants/CreateTenantModal';
import tenantReducer from '../features/tenants/tenantSlice';

vi.mock('../services/tenantApi', () => ({
  createTenant: vi.fn(() => Promise.resolve({ data: { id: 1, name: 'Velox Financial' } })),
}));

function renderModal({ isOpen = true, onClose = vi.fn() } = {}) {
  const store = configureStore({
    reducer: { tenants: tenantReducer },
  });

  const view = render(
    <Provider store={store}>
      <CreateTenantModal isOpen={isOpen} onClose={onClose} />
    </Provider>
  );

  return { onClose, store, ...view };
}

describe('CreateTenantModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /provision tenant/i }));

    expect(screen.getByText('Organization name is required')).toBeInTheDocument();
    expect(screen.getByText('Domain code is required')).toBeInTheDocument();
    expect(screen.getByText('Admin email is required')).toBeInTheDocument();
  });

  it('clears field error when user starts typing', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /provision tenant/i }));
    expect(screen.getByText('Organization name is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/organization name/i), 'Acme');
    expect(screen.queryByText('Organization name is required')).not.toBeInTheDocument();
  });

  it('resets form after successful tenant creation', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderModal({ onClose });

    await user.type(screen.getByLabelText(/organization name/i), 'Velox Financial');
    await user.type(screen.getByLabelText(/tenant domain code/i), 'velox');
    await user.type(screen.getByLabelText(/admin email address/i), 'admin@velox.com');
    await user.click(screen.getByRole('button', { name: /provision tenant/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    rerender(
      <Provider store={configureStore({ reducer: { tenants: tenantReducer } })}>
        <CreateTenantModal isOpen onClose={onClose} />
      </Provider>
    );

    expect(screen.getByLabelText(/organization name/i)).toHaveValue('');
    expect(screen.getByLabelText(/tenant domain code/i)).toHaveValue('');
    expect(screen.getByLabelText(/admin email address/i)).toHaveValue('');
  });

  it('applies icon padding class to subscription plan select', () => {
    renderModal();
    const select = screen.getByLabelText(/subscription plan/i);
    expect(select.className).toContain('input--with-icon');
    expect(select.className).toContain('select-input');
  });

  it('resets form when modal is cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = renderModal({ onClose });

    await user.type(screen.getByLabelText(/organization name/i), 'Temp Org');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
    unmount();

    renderModal({ onClose });
    expect(screen.getByLabelText(/organization name/i)).toHaveValue('');
  });

  it('shows logo URL validation error for invalid URLs', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/organization name/i), 'Acme');
    await user.type(screen.getByLabelText(/tenant domain code/i), 'acme');
    await user.type(screen.getByLabelText(/admin email address/i), 'admin@acme.com');
    await user.type(screen.getByLabelText(/company logo url/i), 'not-a-url');
    await user.click(screen.getByRole('button', { name: /provision tenant/i }));

    expect(
      screen.getByText('Enter a valid URL starting with http:// or https://')
    ).toBeInTheDocument();
  });
});

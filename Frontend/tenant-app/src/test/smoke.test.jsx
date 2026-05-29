import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../pages/LoginPage';
import { Button } from '@trackify/shared';

function renderLogin() {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      }),
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('tenant-app smoke', () => {
  it('renders shared Button', () => {
    render(<Button type="button">Sign in</Button>);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders login page heading', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /log in to continue/i })).toBeInTheDocument();
  });

  it('renders login email field', () => {
    renderLogin();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
});

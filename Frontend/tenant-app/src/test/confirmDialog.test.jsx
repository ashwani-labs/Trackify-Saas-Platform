import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog, useConfirmDialog } from '@trackify/shared';

function ConfirmHarness({ onResult }) {
  const { confirm, dialog } = useConfirmDialog();

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const result = await confirm({
            title: 'Delete item?',
            message: 'This action cannot be undone.',
            confirmLabel: 'Delete',
            variant: 'danger',
          });
          onResult(result);
        }}
      >
        Open confirm
      </button>
      {dialog}
    </>
  );
}

describe('ConfirmDialog', () => {
  it('renders message and action buttons', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete item?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole('heading', { name: 'Delete item?' })).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

describe('useConfirmDialog', () => {
  it('resolves true when confirmed and false when cancelled', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(<ConfirmHarness onResult={onResult} />);

    await user.click(screen.getByRole('button', { name: 'Open confirm' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onResult).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('button', { name: 'Open confirm' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onResult).toHaveBeenCalledWith(false);
  });
});

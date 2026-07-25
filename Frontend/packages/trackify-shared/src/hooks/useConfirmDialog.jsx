import React, { useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const DEFAULT_OPTIONS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'primary',
};

export const useConfirmDialog = () => {
  const [state, setState] = useState({ isOpen: false, options: DEFAULT_OPTIONS });
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        options: { ...DEFAULT_OPTIONS, ...options },
      });
    });
  }, []);

  const handleClose = useCallback((result) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const dialog = (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
      onConfirm={() => handleClose(true)}
      onCancel={() => handleClose(false)}
    />
  );

  return { confirm, dialog };
};

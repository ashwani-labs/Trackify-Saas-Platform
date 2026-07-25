import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    className="modal--narrow"
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {message && <p className="confirm-dialog__message">{message}</p>}
  </Modal>
);

export default ConfirmDialog;

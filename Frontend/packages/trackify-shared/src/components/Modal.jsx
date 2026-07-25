import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, useEscapeKey } from '../hooks/useFocusTrap.js';

const Modal = ({ isOpen, onClose, title, children, footer, className = '' }) => {
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef, isOpen);
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={`modal ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

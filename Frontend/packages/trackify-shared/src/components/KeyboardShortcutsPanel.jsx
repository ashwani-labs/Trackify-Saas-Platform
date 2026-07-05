import { useEffect } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const DEFAULT_SHORTCUTS = [
  { keys: ['?'], description: 'Open keyboard shortcuts' },
  { keys: ['/'], description: 'Focus global search' },
  { keys: ['Esc'], description: 'Close panels and modals' },
  { keys: ['g', 'd'], description: 'Go to dashboard' },
  { keys: ['g', 'p'], description: 'Go to projects' },
];

const KeyboardShortcutsPanel = ({ isOpen, onClose, shortcuts = DEFAULT_SHORTCUTS }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard shortcuts"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ul className="keyboard-shortcuts">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.description} className="keyboard-shortcuts__row">
            <span className="keyboard-shortcuts__desc">{shortcut.description}</span>
            <span className="keyboard-shortcuts__keys">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="keyboard-shortcuts__key">
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default KeyboardShortcutsPanel;

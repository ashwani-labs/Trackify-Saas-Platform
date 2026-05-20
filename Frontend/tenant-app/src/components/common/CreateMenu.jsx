import { useState, useRef, useEffect } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { ChevronDown, FolderKanban, Bug } from 'lucide-react';
import { Button } from '@trackify/shared';

const CreateMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const projectMatch = useMatch('/projects/:id');
  const projectId = projectMatch?.params?.id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goProject = () => {
    setOpen(false);
    navigate('/projects', { state: { openCreate: true } });
  };

  const goIssue = () => {
    setOpen(false);
    if (projectId) {
      navigate(`/projects/${projectId}?createIssue=1`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="dropdown hide-mobile" ref={ref}>
      <Button
        variant="primary"
        rightIcon={<ChevronDown size={14} />}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Create
      </Button>
      {open && (
        <div className="dropdown-menu" role="menu">
          <button type="button" className="dropdown-item" role="menuitem" onClick={goIssue}>
            <Bug size={16} /> Issue
          </button>
          <button type="button" className="dropdown-item" role="menuitem" onClick={goProject}>
            <FolderKanban size={16} /> Project
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateMenu;

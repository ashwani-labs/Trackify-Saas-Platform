import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, FolderKanban, Bug } from 'lucide-react';
import { fetchProjects } from '../../features/projects/projectSlice';
import { setSelectedIssue } from '../../features/issues/issueSlice';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const { projects } = useSelector((s) => s.projects);
  const { issues } = useSelector((s) => s.issues);
  const { currentProject } = useSelector((s) => s.projects);

  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (open && projects.length === 0) {
      dispatch(fetchProjects({ page: 0, size: 50 }));
    }
  }, [open, projects.length, dispatch]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const projectResults = useMemo(() => {
    if (!q) return projects.slice(0, 8);
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.key?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [projects, q]);

  const issueResults = useMemo(() => {
    if (!q || issues.length === 0) return [];
    return issues
      .filter((i) => i.title?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [issues, q]);

  const hasResults = projectResults.length > 0 || issueResults.length > 0;

  const goToProject = useCallback(
    (projectId) => {
      setOpen(false);
      setQuery('');
      navigate(`/projects/${projectId}`);
    },
    [navigate]
  );

  const goToIssue = useCallback(
    (issue) => {
      setOpen(false);
      setQuery('');
      navigate(`/projects/${issue.projectId}`);
      dispatch(setSelectedIssue(issue));
    },
    [navigate, dispatch]
  );

  return (
    <div className="search-panel hide-mobile" ref={panelRef}>
      <div className="input-wrap">
        <Search className="input-wrap__icon" size={14} />
        <input
          ref={inputRef}
          type="search"
          className="input input--with-icon topbar-search__input"
          placeholder="Search projects and issues (/)"
          aria-label="Search projects and issues"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (q || projects.length > 0) && (
        <div className="search-results" role="listbox">
          {projectResults.length > 0 && (
            <>
              <div className="search-results__section">Projects</div>
              {projectResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="search-result"
                  role="option"
                  onClick={() => goToProject(p.id)}
                >
                  <FolderKanban size={16} color="var(--primary)" />
                  <div>
                    <div className="search-result__title">{p.name}</div>
                    <div className="search-result__meta">{p.key}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {issueResults.length > 0 && (
            <>
              <div className="search-results__section">
                Issues{currentProject ? ` in ${currentProject.name}` : ''}
              </div>
              {issueResults.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  className="search-result"
                  role="option"
                  onClick={() => goToIssue(issue)}
                >
                  <Bug size={16} color="var(--text-muted)" />
                  <div>
                    <div className="search-result__title">{issue.title}</div>
                    <div className="search-result__meta">{issue.status}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {!hasResults && q && (
            <div className="search-results__empty">No matches for &quot;{query}&quot;</div>
          )}

          {issues.length === 0 && q && (
            <p className="search-hint">
              Open a project to search its issues, or browse projects above.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

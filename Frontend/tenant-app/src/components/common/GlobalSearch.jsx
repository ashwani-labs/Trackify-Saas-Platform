import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Search, FolderKanban, Bug, Users } from 'lucide-react';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import { fetchGlobalSearch } from '../../features/search/searchApi';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ projects: [], issues: [], users: [] });

  const q = query.trim();

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

  useEffect(() => {
    if (!open || q.length === 0) {
      setResults({ projects: [], issues: [], users: [] });
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchGlobalSearch(q);
        if (!cancelled) {
          setResults({
            projects: data.projects ?? [],
            issues: data.issues ?? [],
            users: data.users ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setResults({ projects: [], issues: [], users: [] });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, open]);

  const { projects, issues, users } = results;
  const hasResults = projects.length > 0 || issues.length > 0 || users.length > 0;

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

  const goToTeam = useCallback(() => {
    setOpen(false);
    setQuery('');
    navigate('/team');
  }, [navigate]);

  return (
    <div className="search-panel hide-mobile" ref={panelRef}>
      <div className="input-wrap">
        <Search className="input-wrap__icon" size={14} />
        <input
          ref={inputRef}
          type="search"
          className="input input--with-icon topbar-search__input"
          placeholder="Search projects, issues, and people (/)"
          aria-label="Search projects, issues, and people"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && q && (
        <div className="search-results" role="listbox">
          {loading && <div className="search-results__empty">Searching…</div>}

          {!loading && projects.length > 0 && (
            <>
              <div className="search-results__section">Projects</div>
              {projects.map((p) => (
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
                    {p.description && (
                      <div className="search-result__meta">{p.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && issues.length > 0 && (
            <>
              <div className="search-results__section">Issues</div>
              {issues.map((issue) => (
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
                    <div className="search-result__meta">
                      {issue.projectHeaderName} · {issue.status}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && users.length > 0 && (
            <>
              <div className="search-results__section">People</div>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="search-result"
                  role="option"
                  onClick={goToTeam}
                >
                  <Users size={16} color="var(--text-muted)" />
                  <div>
                    <div className="search-result__title">
                      {user.fullName || user.email}
                    </div>
                    <div className="search-result__meta">{user.email}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && !hasResults && (
            <div className="search-results__empty">No matches for &quot;{query}&quot;</div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

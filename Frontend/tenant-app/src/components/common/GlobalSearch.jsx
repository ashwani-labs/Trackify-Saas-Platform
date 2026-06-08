import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState({ projects: [], issues: [], users: [] });

  const q = query.trim();
  const { projects, issues, users } = results;

  const flatResults = useMemo(() => {
    const items = [];
    projects.forEach((p) => items.push({ type: 'project', data: p, id: `project-${p.id}` }));
    issues.forEach((i) => items.push({ type: 'issue', data: i, id: `issue-${i.id}` }));
    users.forEach((u) => items.push({ type: 'user', data: u, id: `user-${u.id}` }));
    return items;
  }, [projects, issues, users]);

  const hasResults = flatResults.length > 0;

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const goToProject = useCallback(
    (projectId) => {
      closeSearch();
      navigate(`/projects/${projectId}`);
    },
    [navigate, closeSearch]
  );

  const goToIssue = useCallback(
    (issue) => {
      closeSearch();
      if (issue.issueKey) {
        navigate(`/projects/${issue.projectId}/issue/${issue.issueKey}`);
      } else {
        navigate(`/projects/${issue.projectId}`);
        dispatch(setSelectedIssue(issue));
      }
    },
    [navigate, dispatch, closeSearch]
  );

  const goToTeam = useCallback(() => {
    closeSearch();
    navigate('/team');
  }, [navigate, closeSearch]);

  const activateItem = useCallback(
    (item) => {
      if (!item) return;
      if (item.type === 'project') goToProject(item.data.id);
      else if (item.type === 'issue') goToIssue(item.data);
      else goToTeam();
    },
    [goToProject, goToIssue, goToTeam]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
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
      setActiveIndex(-1);
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

  useEffect(() => {
    if (!loading && hasResults) {
      setActiveIndex(0);
    } else if (!hasResults) {
      setActiveIndex(-1);
    }
  }, [loading, hasResults, projects, issues, users]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      inputRef.current?.blur();
      return;
    }

    if (!open || !q || loading) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (flatResults.length === 0) return -1;
        if (prev < 0) return 0;
        return Math.min(prev + 1, flatResults.length - 1);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (flatResults.length === 0) return -1;
        if (prev < 0) return flatResults.length - 1;
        return Math.max(prev - 1, 0);
      });
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      activateItem(flatResults[activeIndex]);
    }
  };

  let resultIndex = -1;

  return (
    <div className="search-panel" ref={panelRef}>
      <div className="input-wrap">
        <Search className="input-wrap__icon" size={14} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="input input--with-icon topbar-search__input"
          placeholder="Search projects, issues, and people (/)"
          aria-label="Search projects, issues, and people"
          aria-expanded={open && Boolean(q)}
          aria-controls="global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          role="combobox"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      {open && q && (
        <div
          id="global-search-results"
          className="search-results"
          role="listbox"
          ref={listRef}
          aria-label="Search results"
        >
          {loading && <div className="search-results__empty">Searching…</div>}

          {!loading && projects.length > 0 && (
            <>
              <div className="search-results__section">Projects</div>
              {projects.map((p) => {
                resultIndex += 1;
                const idx = resultIndex;
                return (
                  <button
                    key={p.id}
                    id={`search-option-${idx}`}
                    data-index={idx}
                    type="button"
                    className={`search-result${activeIndex === idx ? ' search-result--active' : ''}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => goToProject(p.id)}
                  >
                    <FolderKanban size={16} color="var(--primary)" aria-hidden />
                    <div>
                      <div className="search-result__title">{p.name}</div>
                      {p.description && <div className="search-result__meta">{p.description}</div>}
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {!loading && issues.length > 0 && (
            <>
              <div className="search-results__section">Issues</div>
              {issues.map((issue) => {
                resultIndex += 1;
                const idx = resultIndex;
                return (
                  <button
                    key={issue.id}
                    id={`search-option-${idx}`}
                    data-index={idx}
                    type="button"
                    className={`search-result${activeIndex === idx ? ' search-result--active' : ''}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => goToIssue(issue)}
                  >
                    <Bug size={16} color="var(--text-muted)" aria-hidden />
                    <div>
                      <div className="search-result__title">{issue.title}</div>
                      <div className="search-result__meta">
                        {issue.issueKey || issue.projectHeaderName} · {issue.status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {!loading && users.length > 0 && (
            <>
              <div className="search-results__section">People</div>
              {users.map((user) => {
                resultIndex += 1;
                const idx = resultIndex;
                return (
                  <button
                    key={user.id}
                    id={`search-option-${idx}`}
                    data-index={idx}
                    type="button"
                    className={`search-result${activeIndex === idx ? ' search-result--active' : ''}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={goToTeam}
                  >
                    <Users size={16} color="var(--text-muted)" aria-hidden />
                    <div>
                      <div className="search-result__title">{user.fullName || user.email}</div>
                      <div className="search-result__meta">{user.email}</div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {!loading && !hasResults && (
            <div className="search-results__empty">No matches for &quot;{query}&quot;</div>
          )}

          {!loading && hasResults && (
            <div className="search-hint">↑↓ navigate · Enter select · Esc close</div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

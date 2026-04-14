import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../features/issues/issueSlice';
import styles from './IssueFilterBar.module.css';
import { SlidersHorizontal, X } from 'lucide-react';

const STATUS_OPTIONS  = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_LABELS  = { ALL: 'All Status',    TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const PRIORITY_LABELS = { ALL: 'All Priority', LOW: 'Low',   MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

const IssueFilterBar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.issues);
  const hasActiveFilters = filters.status !== 'ALL' || filters.priority !== 'ALL';

  const handleStatus   = (e) => dispatch(setFilters({ status: e.target.value }));
  const handlePriority = (e) => dispatch(setFilters({ priority: e.target.value }));

  return (
    <div className={styles.bar}>
      <SlidersHorizontal size={16} className={styles.icon} />

      <select
        className={styles.select}
        value={filters.status || 'ALL'}
        onChange={handleStatus}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.priority || 'ALL'}
        onChange={handlePriority}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          className={styles.clearBtn}
          onClick={() => dispatch(clearFilters())}
          title="Clear filters"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
};

export default IssueFilterBar;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../features/issues/issueSlice';
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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '0.75rem 1rem', 
      backgroundColor: 'var(--bg-input)', 
      borderRadius: 'var(--radius-md)',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    }}>
      <SlidersHorizontal size={18} style={{ color: 'var(--text-muted)' }} />

      <select
        className="input-field"
        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 1rem', height: 'auto', fontSize: '0.85rem' }}
        value={filters.status || 'ALL'}
        onChange={handleStatus}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        className="input-field"
        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 1rem', height: 'auto', fontSize: '0.85rem' }}
        value={filters.priority || 'ALL'}
        onChange={handlePriority}
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          onClick={() => dispatch(clearFilters())}
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
};

export default IssueFilterBar;

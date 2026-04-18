import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue } from '../../features/issues/issueSlice';
import { startSprint, completeSprint } from '../../features/sprints/sprintSlice';
import toast from 'react-hot-toast';

const IssueListItem = ({ issue, sprints, dispatch }) => {
  const handleSprintChange = (e) => {
    const sprintId = e.target.value === '' ? null : Number(e.target.value);
    dispatch(updateIssue({
      id: issue.id,
      data: { sprintId, projectId: issue.projectId }
    }));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#1c1c1e', borderBottom: '1px solid #333', gap: '16px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: '#e5e7eb' }}>{issue.projectHeaderName}-{issue.id} : {issue.title}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          Status: {issue.status} | Priority: {issue.priority}
        </div>
      </div>
      <div>
        <select 
          value={issue.sprintId || ''} 
          onChange={handleSprintChange} 
          style={{ padding: '6px', background: '#2c2c2e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        >
          <option value="">-- Backlog --</option>
          {sprints.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const BacklogView = ({ projectId, issues, onCreateSprint }) => {
  const dispatch = useDispatch();
  const { list: sprints } = useSelector(s => s.sprints);

  const backlogIssues = issues.filter(i => !i.sprintId);

  const handleStart = async (sprintId) => {
    try {
      await dispatch(startSprint({ id: sprintId, projectId })).unwrap();
      toast.success('Sprint started!');
    } catch (e) {
      toast.error(e.message || 'Cannot start sprint');
    }
  };

  const handleComplete = async (sprintId) => {
    try {
      if (window.confirm("Are you sure you want to complete this sprint?")) {
         await dispatch(completeSprint({ id: sprintId, projectId })).unwrap();
         toast.success('Sprint completed!');
      }
    } catch (e) {
      toast.error(e.message || 'Cannot complete sprint');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#e5e7eb' }}>Sprints & Backlog</h2>
        <button onClick={onCreateSprint} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Create Sprint</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Planned / Active Sprints */}
        {sprints.filter(s => s.status !== 'COMPLETED').map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          return (
            <div key={sprint.id} style={{ background: '#18181b', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '16px', background: '#27272a', borderBottom: '1px solid #3f3f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f3f4f6' }}>
                    {sprint.name} 
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: sprint.status === 'ACTIVE' ? '#059669' : '#4b5563', color: '#fff' }}>{sprint.status}</span>
                  </h3>
                  {sprint.goal && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>{sprint.goal}</p>}
                </div>
                <div>
                  {sprint.status === 'PLANNED' && (
                    <button onClick={() => handleStart(sprint.id)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start Sprint</button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button onClick={() => handleComplete(sprint.id)} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Complete</button>
                  )}
                </div>
              </div>
              <div style={{ minHeight: '60px' }}>
                {sprintIssues.length === 0 ? (
                  <p style={{ padding: '16px', margin: 0, color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>No issues planned in this sprint.</p>
                ) : (
                  sprintIssues.map(issue => <IssueListItem key={issue.id} issue={issue} sprints={sprints} dispatch={dispatch} />)
                )}
              </div>
            </div>
          );
        })}

        {/* Backlog */}
        <div style={{ background: '#18181b', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
           <div style={{ padding: '16px', background: '#27272a', borderBottom: '1px solid #3f3f46' }}>
             <h3 style={{ margin: 0, color: '#f3f4f6' }}>Backlog</h3>
           </div>
           <div style={{ minHeight: '100px' }}>
             {backlogIssues.length === 0 ? (
               <p style={{ padding: '16px', margin: 0, color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>Your backlog is empty.</p>
             ) : (
               backlogIssues.map(issue => <IssueListItem key={issue.id} issue={issue} sprints={sprints} dispatch={dispatch} />)
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogView;

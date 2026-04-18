import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById } from '../features/projects/projectSlice';
import {
  fetchIssuesByProject,
  clearIssues,
} from '../features/issues/issueSlice';
import { fetchSprintsByProject } from '../features/sprints/sprintSlice';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailPanel from '../components/issues/IssueDetailPanel';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import ProjectMembersModal from '../components/projects/ProjectMembersModal';
import BacklogView from '../components/sprints/BacklogView';
import CreateSprintModal from '../components/sprints/CreateSprintModal';
import { Users, LayoutDashboard, ListTodo } from 'lucide-react';
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProject, isLoading: projectLoading } = useSelector((s) => s.projects);
  const { selectedIssue, issues, filters } = useSelector((s) => s.issues);
  const { list: sprints } = useSelector((s) => s.sprints);
  
  const [viewMode, setViewMode] = useState('BOARD'); // 'BOARD' or 'BACKLOG'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  // Apply client-side filters
  const filteredIssues = issues.filter((issue) => {
    const statusMatch   = !filters.status   || filters.status   === 'ALL' || issue.status   === filters.status;
    const priorityMatch = !filters.priority || filters.priority === 'ALL' || issue.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchIssuesByProject(id));
    dispatch(fetchSprintsByProject(id));

    return () => {
      dispatch(clearIssues());
    };
  }, [id, dispatch]);

  const activeSprint = sprints.find(s => s.status === 'ACTIVE');
  
  // For Kanban board, we ONLY show issues from the active sprint
  const boardIssues = viewMode === 'BOARD' && activeSprint 
      ? filteredIssues.filter(i => i.sprintId === activeSprint.id) 
      : [];

  const todoCount       = boardIssues.filter((i) => i.status === 'TODO').length;
  const inProgressCount = boardIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount       = boardIssues.filter((i) => i.status === 'DONE').length;

  if (projectLoading && !currentProject) {
    return (
      <div className={styles.loadingWrapper}>
        <div className="spinner" />
        <p>Loading project…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => navigate('/projects')}>
            ← Projects
          </button>
          <span className={styles.separator}>/</span>
          <span className={styles.projectName}>
            {currentProject?.name || 'Loading…'}
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.stats}>
            {viewMode === 'BOARD' && activeSprint && (
              <>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{todoCount}</span>
                  <span className={styles.statLabel}>To Do</span>
                </div>
                <div className={styles.stat}>
                  <span className={`${styles.statNum} ${styles.statInProgress}`}>{inProgressCount}</span>
                  <span className={styles.statLabel}>In Progress</span>
                </div>
                <div className={styles.stat}>
                  <span className={`${styles.statNum} ${styles.statDone}`}>{doneCount}</span>
                  <span className={styles.statLabel}>Done</span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsMembersModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-item, #181825)', color: 'var(--text-primary, #cdd6f4)',
                border: '1px solid var(--border-color, #313244)', padding: '0 1rem',
                borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-hover, #313244)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-item, #181825)'; }}
            >
              <Users size={16} /> Members
            </button>
            <button
              className={styles.createIssueBtn}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span>+</span> Create Issue
            </button>
          </div>
        </div>
      </div>

      {/* ── Project Meta ── */}
      {currentProject && (
        <div className={styles.projectMeta}>
          <span className={styles.projectKey}>{currentProject.key}</span>
          {currentProject.description && (
            <p className={styles.projectDesc}>{currentProject.description}</p>
          )}
          {currentProject.category && (
            <span className={styles.categoryTag}>{currentProject.category}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#1c1c1e', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
        <button 
          onClick={() => setViewMode('BOARD')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: viewMode === 'BOARD' ? '#313244' : 'transparent', color: viewMode === 'BOARD' ? '#cdd6f4' : '#888', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <LayoutDashboard size={14} /> Board
        </button>
        <button 
          onClick={() => setViewMode('BACKLOG')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: viewMode === 'BACKLOG' ? '#313244' : 'transparent', color: viewMode === 'BACKLOG' ? '#cdd6f4' : '#888', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <ListTodo size={14} /> Backlog
        </button>
      </div>

      {viewMode === 'BOARD' && (
        <>
          <IssueFilterBar />
          {activeSprint ? (
            <KanbanBoard
              projectId={Number(id)}
              filteredIssues={boardIssues}
              onCreateIssue={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#18181b', borderRadius: '8px', border: '1px dashed #333' }}>
              <h2 style={{ fontSize: '20px', color: '#e5e7eb', marginBottom: '8px' }}>No Active Sprint</h2>
              <p style={{ color: '#9ca3af', marginBottom: '24px' }}>There is no active sprint for this project. Start a sprint from the Backlog to see the board.</p>
              <button 
                onClick={() => setViewMode('BACKLOG')}
                style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Go to Backlog
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === 'BACKLOG' && (
        <BacklogView 
          projectId={Number(id)} 
          issues={filteredIssues} 
          onCreateSprint={() => setIsSprintModalOpen(true)}
        />
      )}

      {/* ── Modals & Panels ── */}
      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={Number(id)}
        />
      )}

      <CreateSprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        projectId={Number(id)}
      />

      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={Number(id)}
      />

      {selectedIssue && <IssueDetailPanel />}
    </div>
  );
};

export default ProjectDetailPage;

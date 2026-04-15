import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById } from '../features/projects/projectSlice';
import {
  fetchIssuesByProject,
  clearIssues,
} from '../features/issues/issueSlice';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailPanel from '../components/issues/IssueDetailPanel';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import ProjectMembersModal from '../components/projects/ProjectMembersModal';
import { Users } from 'lucide-react';
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProject, isLoading: projectLoading } = useSelector((s) => s.projects);
  const { selectedIssue, issues, filters } = useSelector((s) => s.issues);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Apply client-side filters
  const filteredIssues = issues.filter((issue) => {
    const statusMatch   = !filters.status   || filters.status   === 'ALL' || issue.status   === filters.status;
    const priorityMatch = !filters.priority || filters.priority === 'ALL' || issue.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchIssuesByProject(id));

    return () => {
      dispatch(clearIssues());
    };
  }, [id, dispatch]);

  const todoCount       = filteredIssues.filter((i) => i.status === 'TODO').length;
  const inProgressCount = filteredIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount       = filteredIssues.filter((i) => i.status === 'DONE').length;

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

      {/* ── Filter Bar ── */}
      <IssueFilterBar />

      {/* ── Kanban Board ── */}
      <KanbanBoard
        projectId={Number(id)}
        filteredIssues={filteredIssues}
        onCreateIssue={() => setIsCreateModalOpen(true)}
      />

      {/* ── Modals & Panels ── */}
      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={Number(id)}
        />
      )}

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

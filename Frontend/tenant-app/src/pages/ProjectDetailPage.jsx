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
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProject, isLoading: projectLoading } = useSelector((s) => s.projects);
  const { selectedIssue, issues } = useSelector((s) => s.issues);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchIssuesByProject(id));

    return () => {
      dispatch(clearIssues());
    };
  }, [id, dispatch]);

  const todoCount      = issues.filter((i) => i.status === 'TODO').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount      = issues.filter((i) => i.status === 'DONE').length;

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

          <button
            className={styles.createIssueBtn}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+</span> Create Issue
          </button>
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

      {/* ── Kanban Board ── */}
      <KanbanBoard
        projectId={Number(id)}
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

      {selectedIssue && <IssueDetailPanel />}
    </div>
  );
};

export default ProjectDetailPage;

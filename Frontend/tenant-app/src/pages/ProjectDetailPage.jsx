import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById } from '../features/projects/projectSlice';
import { fetchIssuesByProject, clearIssues } from '../features/issues/issueSlice';
import { fetchSprintsByProject } from '../features/sprints/sprintSlice';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailPanel from '../components/issues/IssueDetailPanel';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import ProjectMembersModal from '../components/projects/ProjectMembersModal';
import BacklogView from '../components/sprints/BacklogView';
import CreateSprintModal from '../components/sprints/CreateSprintModal';
import { Users, LayoutDashboard, ListTodo, Plus, Calendar } from 'lucide-react';
import { Button, PageHeader } from '@trackify/shared';

const STAT_CONFIG = [
  { label: 'To Do', status: 'TODO', pillClass: 'stat-pill--todo' },
  { label: 'In Progress', status: 'IN_PROGRESS', pillClass: 'stat-pill--progress' },
  { label: 'Done', status: 'DONE', pillClass: 'stat-pill--done' },
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { currentProject, isLoading: projectLoading } = useSelector((s) => s.projects);
  const { selectedIssue, issues, filters } = useSelector((s) => s.issues);
  const { list: sprints } = useSelector((s) => s.sprints);

  const [viewMode, setViewMode] = useState('BOARD');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchIssuesByProject(id));
    dispatch(fetchSprintsByProject(id));

    return () => {
      dispatch(clearIssues());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (searchParams.get('createIssue') === '1') {
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');

  const filteredIssues = issues.filter((issue) => {
    const statusMatch =
      !filters.status || filters.status === 'ALL' || issue.status === filters.status;
    const priorityMatch =
      !filters.priority || filters.priority === 'ALL' || issue.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  const boardIssues =
    viewMode === 'BOARD' && activeSprint
      ? filteredIssues.filter((i) => i.sprintId === activeSprint.id)
      : [];

  if (projectLoading && !currentProject) {
    return (
      <div className="page-loading">
        <div className="skeleton page-loading__bar" />
        <div className="skeleton page-loading__body" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Projects / {currentProject?.name} /{' '}
            <strong>{viewMode === 'BOARD' ? 'Kanban Board' : 'Backlog'}</strong>
          </>
        }
        title={
          <div className="project-header__meta">
            <div className="project-avatar">
              {currentProject?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="page-title">{currentProject?.name}</span>
              <p className="page-subtitle">Software project</p>
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" leftIcon={<Users size={16} />} onClick={() => setIsMembersModalOpen(true)}>
              Team
            </Button>
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
              Create Issue
            </Button>
          </>
        }
      />

      <div className="tabs">
        <button
          type="button"
          className={`tab ${viewMode === 'BOARD' ? 'tab--active' : ''}`}
          onClick={() => setViewMode('BOARD')}
        >
          <LayoutDashboard size={16} /> Board
        </button>
        <button
          type="button"
          className={`tab ${viewMode === 'BACKLOG' ? 'tab--active' : ''}`}
          onClick={() => setViewMode('BACKLOG')}
        >
          <ListTodo size={16} /> Backlog
        </button>
      </div>

      {viewMode === 'BOARD' && activeSprint && (
        <div className="sprint-banner">
          <div className="sprint-banner__info">
            <Calendar size={14} />
            <span>
              Active sprint: <strong>{activeSprint.name}</strong>
            </span>
          </div>
          <div className="sprint-banner__stats">
            {STAT_CONFIG.map(({ label, status, pillClass }) => {
              const val = boardIssues.filter((i) => i.status === status).length;
              return (
                <div key={status} className="stat-pill-group">
                  <span className={`stat-pill ${pillClass}`}>{val}</span>
                  <span className="stat-pill__label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="project-detail-body">
        {viewMode === 'BOARD' && (
          <>
            <IssueFilterBar />
            {activeSprint ? (
              <KanbanBoard
                filteredIssues={boardIssues}
                onCreateIssue={() => setIsCreateModalOpen(true)}
              />
            ) : (
              <div className="board-empty">
                <LayoutDashboard size={48} className="board-empty__icon" />
                <h2 className="board-empty__title">No active sprint</h2>
                <p className="board-empty__text">
                  Go to the backlog to plan and start a sprint to see issues on the board.
                </p>
                <Button variant="primary" onClick={() => setViewMode('BACKLOG')}>
                  Go to Backlog
                </Button>
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
      </div>

      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={Number(id)}
        />
      )}

      {isSprintModalOpen && (
        <CreateSprintModal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          projectId={Number(id)}
        />
      )}

      {isMembersModalOpen && (
        <ProjectMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          projectId={Number(id)}
        />
      )}

      {selectedIssue && <IssueDetailPanel />}
    </div>
  );
};

export default ProjectDetailPage;

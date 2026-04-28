import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Users, LayoutDashboard, ListTodo, Plus, ChevronLeft, Calendar } from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const stats = [
    {
      label: 'To Do',
      val: boardIssues.filter((i) => i.status === 'TODO').length,
      color: '#42526E',
    },
    {
      label: 'In Progress',
      val: boardIssues.filter((i) => i.status === 'IN_PROGRESS').length,
      color: '#FFAB00',
    },
    {
      label: 'Done',
      val: boardIssues.filter((i) => i.status === 'DONE').length,
      color: '#36B37E',
    },
  ];

  if (projectLoading && !currentProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="skeleton" style={{ height: '100px', width: '100%' }} />
        <div className="skeleton" style={{ height: '400px', width: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Projects / {currentProject?.name} / <span style={{ color: 'var(--text-main)' }}>{viewMode === 'BOARD' ? 'Kanban Board' : 'Backlog'}</span>
      </nav>

      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{ 
              width: '40px', 
              height: '40px', 
              background: '#0052CC', 
              borderRadius: '3px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700'
            }}
          >
            {currentProject?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{currentProject?.name}</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Software Project</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsMembersModalOpen(true)} style={{ height: '32px' }}>
            <Users size={16} /> Team
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ height: '32px' }}
          >
            <Plus size={16} /> Create Issue
          </button>
        </div>
      </header>

      {/* View Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-main)',
          marginBottom: '1.5rem',
          gap: '2rem'
        }}
      >
        <button
          onClick={() => setViewMode('BOARD')}
          style={{
            padding: '0.5rem 0.25rem',
            background: 'none',
            border: 'none',
            borderBottom: viewMode === 'BOARD' ? '2px solid var(--primary)' : '2px solid transparent',
            color: viewMode === 'BOARD' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LayoutDashboard size={16} /> Board
        </button>
        <button
          onClick={() => setViewMode('BACKLOG')}
          style={{
            padding: '0.5rem 0.25rem',
            background: 'none',
            border: 'none',
            borderBottom: viewMode === 'BACKLOG' ? '2px solid var(--primary)' : '2px solid transparent',
            color: viewMode === 'BACKLOG' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ListTodo size={16} /> Backlog
        </button>
      </div>

      {viewMode === 'BOARD' && activeSprint && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: '#F4F5F7',
            borderRadius: '3px',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            <Calendar size={14} color="#42526E" />
            <span>Active Sprint: <strong>{activeSprint.name}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    backgroundColor: s.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '10px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}
                >
                  {s.val}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div style={{ minHeight: '600px' }}>
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
              <div
                style={{ textAlign: 'center', padding: '6rem 2rem', border: '2px dashed var(--border-main)', borderRadius: '3px' }}
              >
                <LayoutDashboard
                  size={48}
                  style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.5 }}
                />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No active sprint</h2>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto 2rem',
                    fontSize: '0.875rem'
                  }}
                >
                  Go to the backlog to plan and start a sprint to see issues on the board.
                </p>
                <button className="btn btn-primary" onClick={() => setViewMode('BACKLOG')}>
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
      </div>

      {/* Modals & Panels */}
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

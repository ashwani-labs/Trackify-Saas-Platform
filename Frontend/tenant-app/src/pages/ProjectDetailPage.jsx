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

  const activeSprint = sprints.find(s => s.status === 'ACTIVE');
  
  const filteredIssues = issues.filter((issue) => {
    const statusMatch   = !filters.status   || filters.status   === 'ALL' || issue.status   === filters.status;
    const priorityMatch = !filters.priority || filters.priority === 'ALL' || issue.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  const boardIssues = viewMode === 'BOARD' && activeSprint 
      ? filteredIssues.filter(i => i.sprintId === activeSprint.id) 
      : [];

  const stats = [
    { label: 'To Do', val: boardIssues.filter(i => i.status === 'TODO').length, color: 'var(--text-muted)' },
    { label: 'In Progress', val: boardIssues.filter(i => i.status === 'IN_PROGRESS').length, color: 'var(--warning)' },
    { label: 'Done', val: boardIssues.filter(i => i.status === 'DONE').length, color: 'var(--success)' }
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
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1400px', margin: '0 auto' }}>
      {/* breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/projects')} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}
        >
          <ChevronLeft size={16} /> Projects
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>{currentProject?.key}</span>
      </nav>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
             <div className="avatar-circle" style={{ borderRadius: 'var(--radius-md)', width: '48px', height: '48px' }}>{currentProject?.key?.substring(0, 2)}</div>
             <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>{currentProject?.name}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
            {currentProject?.description || 'Build, track and release great software with Trackify.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsMembersModalOpen(true)}>
             <Users size={18} /> Manage Team
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '0.75rem 1.5rem' }}>
            <Plus size={20} /> Create Issue
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => setViewMode('BOARD')}
            className={`btn ${viewMode === 'BOARD' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.5rem 1.25rem' }}
          >
            <LayoutDashboard size={18} /> Board
          </button>
          <button 
            onClick={() => setViewMode('BACKLOG')}
            className={`btn ${viewMode === 'BACKLOG' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.5rem 1.25rem' }}
          >
            <ListTodo size={18} /> Backlog
          </button>
        </div>

        {viewMode === 'BOARD' && activeSprint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Calendar size={14} />
                <span>Active Sprint: <strong style={{ color: 'var(--text-main)' }}>{activeSprint.name}</strong></span>
             </div>
             <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-main)' }} />
             <div style={{ display: 'flex', gap: '1rem' }}>
               {stats.map(s => (
                 <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{s.val} {s.label}</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

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
              <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', borderStyle: 'dashed' }}>
                <LayoutDashboard size={80} style={{ color: 'var(--text-muted)', opacity: 0.1, marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Board is Empty</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                  There are no active sprints in this project. Go to the backlog to plan and start a sprint.
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

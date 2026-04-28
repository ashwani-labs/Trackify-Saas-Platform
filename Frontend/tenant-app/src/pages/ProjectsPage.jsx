import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, clearProjectError } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/common/Pagination';
import { Plus, FolderKanban, ArrowRight, Layers, Clock } from 'lucide-react';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, currentPage, totalPages, isLoading, error } = useSelector(
    (state) => state.projects
  );
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    dispatch(fetchProjects({ page: 0, size: 10 }));
    return () => dispatch(clearProjectError());
  }, [dispatch]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <nav style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Workspaces / <span style={{ color: 'var(--text-main)' }}>Projects</span>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            A central list of all projects and workspaces within your organization.
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ height: '32px' }}>
            <Plus size={16} /> Create Project
          </button>
        )}
      </header>

      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '2rem',
            backgroundColor: '#FFEBE6',
            color: '#BF2600',
            borderRadius: '3px',
            fontSize: '0.875rem',
            border: '1px solid #FFBDAD'
          }}
        >
          {error}
        </div>
      )}

      {isLoading && projects.length === 0 ? (
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '180px' }}></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            borderStyle: 'dashed'
          }}
        >
          <div style={{ background: '#F4F5F7', padding: '1.5rem', borderRadius: '3px' }}>
            <FolderKanban size={40} color="#42526E" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No projects yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
              Create a project to start tracking issues, planning sprints, and collaborating with your team.
            </p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="stats-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '24px', height: '24px', background: '#0052CC', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>
                      {project.name.charAt(0).toUpperCase()}
                   </div>
                   <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>{project.key}</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  <Layers size={16} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{project.name}</h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.6',
                  }}
                >
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Clock size={12} />
                  <span>Updated {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <ArrowRight size={16} color="var(--primary)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-main)', paddingTop: '1rem' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(fetchProjects({ page, size: 10 }))}
          />
        </div>
      )}

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ProjectsPage;

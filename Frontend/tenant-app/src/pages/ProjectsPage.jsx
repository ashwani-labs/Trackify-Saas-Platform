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
  const { projects, currentPage, totalPages, isLoading, error } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    dispatch(fetchProjects({ page: 0, size: 10 }));
    return () => dispatch(clearProjectError());
  }, [dispatch]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="hero-section">
        <div>
          <h1 className="hero-title">Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your organization's work and development cycles.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create Project
          </button>
        )}
      </header>

      {error && <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>{error}</div>}

      {isLoading && projects.length === 0 ? (
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="card skeleton" style={{ height: '200px' }}></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '2rem', borderRadius: '50%' }}>
            <FolderKanban size={48} color="var(--text-muted)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No projects found</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get started by creating your first project workspace.</p>
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
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-primary">{project.key}</span>
                <div style={{ color: 'var(--text-muted)' }}>
                  <Layers size={18} />
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.9rem', 
                  display: '-webkit-box', 
                  WebkitLineClamp: '2', 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.5'
                }}>
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <ArrowRight size={18} color="var(--primary)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: '2rem' }}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page) => dispatch(fetchProjects({ page, size: 10 }))} 
          />
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default ProjectsPage;

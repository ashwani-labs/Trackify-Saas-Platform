import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, clearProjectError } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import styles from './ProjectsPage.module.css';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/common/Pagination';
import Skeleton from '../components/common/Skeleton';

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

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Skeleton type="title" />
        </header>
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} type="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and track your organization's work</p>
        </div>
        {isAdmin && (
          <button 
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            <span>+</span> Create Project
          </button>
        )}
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <h2>No projects found</h2>
          <p>Get started by creating your first project.</p>
          {isAdmin && (
            <button 
              className={styles.createButton} 
              style={{ marginTop: '1.5rem', alignSelf: 'center' }}
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={styles.card}
              onClick={() => handleProjectClick(project.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.projectKey}>{project.key}</span>
                <span className={styles.category}>{project.category || 'Software'}</span>
              </div>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectDescription}>
                {project.description || 'No description provided.'}
              </p>
              <div className={styles.cardFooter}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={(page) => dispatch(fetchProjects({ page, size: 10 }))} 
        />
      )}

      {isModalOpen && (
        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProjectsPage;

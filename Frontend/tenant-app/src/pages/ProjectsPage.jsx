import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProjects, clearProjectError } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Pagination from '../components/common/Pagination';
import { Plus, FolderKanban, ArrowRight, Layers, Clock } from 'lucide-react';
import { ROLES, Button, Alert, EmptyState, PageHeader } from '@trackify/shared';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, currentPage, totalPages, isLoading, error } = useSelector(
    (state) => state.projects
  );
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    dispatch(fetchProjects({ page: 0, size: 10 }));
    return () => dispatch(clearProjectError());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.openCreate && isAdmin) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, isAdmin, navigate, location.pathname]);

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Workspaces / <strong>Projects</strong>
          </>
        }
        title="Projects"
        subtitle="A central list of all projects and workspaces within your organization."
        actions={
          isAdmin && (
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
              Create Project
            </Button>
          )
        }
      />

      {error && <Alert className="page-alert">{error}</Alert>}

      {isLoading && projects.length === 0 ? (
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton project-card-skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={40} />}
          title="No projects yet"
          description="Create a project to start tracking issues, planning sprints, and collaborating with your team."
          action={
            isAdmin && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Create Your First Project
              </Button>
            )
          }
        />
      ) : (
        <div className="stats-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="project-card__top">
                <div className="project-card__identity">
                  <div className="project-card__avatar">{project.name.charAt(0).toUpperCase()}</div>
                  <span className="project-card__key">{project.key}</span>
                </div>
                <Layers size={16} className="project-card__icon" />
              </div>

              <div>
                <h3 className="project-card__title">{project.name}</h3>
                <p className="project-card__desc">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="project-card__footer">
                <span className="project-card__date">
                  <Clock size={12} />
                  Updated {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <ArrowRight size={16} className="project-card__arrow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && totalPages > 1 && (
        <div className="page-pagination">
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

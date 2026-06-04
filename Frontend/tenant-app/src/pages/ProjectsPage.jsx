import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProjects, clearProjectError } from '../features/projects/projectSlice';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import Pagination from '../components/common/Pagination';
import { Plus, FolderKanban, Users } from 'lucide-react';
import { ROLES, Button, Alert, EmptyState, PageHeader } from '@trackify/shared';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, currentPage, totalPages, isLoading, error } = useSelector(
    (state) => state.projects
  );
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;
  const [isModalOpen, setIsModalOpen] = useState(() =>
    Boolean(location.state?.openCreate && isAdmin)
  );

  useEffect(() => {
    dispatch(fetchProjects({ page: 0, size: 10 }));
    return () => dispatch(clearProjectError());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.openCreate) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openCreate, navigate, location.pathname]);

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
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
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
          description="Create a project to start tracking issues, planning sprints, and collaborating with your team. You can invite teammates anytime from Team settings."
          action={
            isAdmin && (
              <div className="empty-state__actions">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Create Your First Project
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Users size={16} />}
                  onClick={() => navigate('/team', { state: { openAdd: true } })}
                >
                  Invite Teammates
                </Button>
              </div>
            )
          }
        />
      ) : (
        <div className="stats-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(id) => navigate(`/projects/${id}`)}
            />
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

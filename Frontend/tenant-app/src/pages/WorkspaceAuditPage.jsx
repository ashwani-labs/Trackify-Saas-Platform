import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader, Button } from '@trackify/shared';
import api from '../utils/axios';
import ProjectActivityFeed from '../components/projects/ProjectActivityFeed';

const WorkspaceAuditPage = () => {
  const [events, setEvents] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/activity/workspace?page=${page}&size=25`);
        const data = response.data?.data;
        if (!cancelled) {
          setEvents(data?.content || []);
          setTotalElements(data?.totalElements || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load workspace activity');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalElements / 25));

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Administration / <strong>Audit log</strong>
          </>
        }
        title="Workspace audit log"
        subtitle="Recent activity across all projects in your workspace."
        actions={
          <Link to="/workspace-settings" className="btn btn-secondary">
            Workspace settings
          </Link>
        }
      />

      <ProjectActivityFeed
        events={events}
        isLoading={loading}
        error={error}
        totalElements={totalElements}
        showProjectLinks
        title="Workspace activity"
        emptyTitle="No workspace activity yet"
        emptyDescription="Issue updates, sprint events, and comments will appear here as your team works."
      />

      {totalPages > 1 && (
        <div className="pagination-bar">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="pagination-bar__label">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceAuditPage;

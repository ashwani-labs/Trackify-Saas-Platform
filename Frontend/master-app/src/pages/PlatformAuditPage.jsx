import React, { useEffect, useState } from 'react';
import { PageHeader, Badge, Alert, EmptyState } from '@trackify/shared';
import { fetchAuditLogs } from '../services/tenantApi';
import Pagination from '../components/common/Pagination';

const actionVariant = (action) => {
  if (action?.includes('DELETE')) return 'danger';
  if (action?.includes('STATUS')) return 'warning';
  return 'primary';
};

const PlatformAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchAuditLogs(page, 15);
        if (cancelled) return;
        setLogs(response.data?.content || []);
        setTotalPages(response.data?.totalPages || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load audit logs');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="page">
      <PageHeader
        breadcrumb={
          <>
            Platform / <strong>Audit log</strong>
          </>
        }
        title="Platform audit log"
        subtitle="Track tenant provisioning, status changes, branding updates, and deletions."
      />

      {error && <Alert className="page-alert">{error}</Alert>}

      <div className="card card--flush">
        <div className="table-wrapper table-wrapper--embedded">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Organization</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="skeleton" style={{ height: '180px' }} />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="member-email">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                    </td>
                    <td>{log.tenantName || '—'}</td>
                    <td>{log.details || '—'}</td>
                  </tr>
                ))
              )}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="No audit events yet"
                      description="Platform actions will appear here as organizations are managed."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="card-footer">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAuditPage;

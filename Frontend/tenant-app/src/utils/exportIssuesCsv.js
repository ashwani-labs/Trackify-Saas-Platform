export function exportIssuesToCsv(issues, projectName = 'project') {
  if (!issues?.length) return;

  const headers = [
    'Key',
    'Title',
    'Status',
    'Priority',
    'Labels',
    'Assignee ID',
    'Sprint ID',
    'Created',
    'Updated',
  ];

  const escape = (value) => {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = issues.map((issue) => {
    const key =
      issue.issueKey ||
      (issue.projectHeaderName ? `${issue.projectHeaderName}-${issue.id}` : `ISSUE-${issue.id}`);
    return [
      key,
      issue.title,
      issue.status,
      issue.priority,
      (issue.labels || []).join('; '),
      issue.assigneeId ?? '',
      issue.sprintId ?? '',
      issue.createdAt ?? '',
      issue.updatedAt ?? '',
    ]
      .map(escape)
      .join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = projectName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  link.href = url;
  link.download = `${safeName}-issues.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

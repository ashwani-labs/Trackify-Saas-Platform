const dayMs = 24 * 60 * 60 * 1000;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatLabel = (date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function computeBurndownData(sprint, issues = []) {
  const start = toDate(sprint?.startDate);
  const end = toDate(sprint?.endDate);
  if (!start || !end || end < start) return [];

  const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.id);
  const totalPoints = Math.max(sprintIssues.length, 1);
  const doneCount = sprintIssues.filter((issue) => issue.status === 'DONE').length;
  const remainingToday = totalPoints - doneCount;

  const totalDays = Math.max(Math.ceil((end - start) / dayMs), 1);
  const today = new Date();
  const points = [];

  for (let day = 0; day <= totalDays; day += 1) {
    const date = new Date(start.getTime() + day * dayMs);
    const ideal = Math.max(totalPoints - (totalPoints * day) / totalDays, 0);
    const isPastOrToday = date <= today;
    const progressRatio = Math.min(day / totalDays, 1);
    const remaining = isPastOrToday
      ? Math.max(Math.round(totalPoints - (totalPoints - remainingToday) * progressRatio), 0)
      : null;

    points.push({
      label: formatLabel(date),
      ideal: Number(ideal.toFixed(1)),
      remaining: remaining == null ? undefined : remaining,
    });
  }

  return points;
}

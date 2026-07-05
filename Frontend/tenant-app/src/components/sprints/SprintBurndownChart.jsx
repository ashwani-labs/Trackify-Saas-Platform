import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { computeBurndownData } from '../../utils/sprintBurndown';

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-main)',
  fontSize: '0.8125rem',
};

const SprintBurndownChart = ({ sprint, issues }) => {
  const data = computeBurndownData(sprint, issues);

  if (!data.length) {
    return <p className="issue-detail-panel__empty">Add issues to this sprint to see burndown.</p>;
  }

  return (
    <div className="sprint-burndown" aria-label={`Burndown chart for ${sprint.name}`}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-main)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="ideal"
            name="Ideal"
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="remaining"
            name="Remaining"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SprintBurndownChart;

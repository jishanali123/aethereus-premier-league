import { Row, Col, Card, Typography, Progress, Tooltip } from 'antd';
import { useLeague, formatPrice } from '../context/LeagueContext';

const { Text } = Typography;

export default function TeamPurseStrip({ selectedTeam = null, onTeamClick }) {
  const { teams, teamStats } = useLeague();

  const handleClick = (teamName) => {
    if (!onTeamClick) return;
    // Click the same team again to clear the filter.
    onTeamClick(selectedTeam === teamName ? null : teamName);
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 0 }}>
      {teams.map((t) => {
        const stats = teamStats[t.name];
        const spent = stats?.spent ?? 0;
        const remaining = stats?.remaining ?? t.totalPurse;
        const count = stats?.count ?? 0;
        const pct = t.totalPurse
          ? Math.round((spent / t.totalPurse) * 100)
          : 0;
        const isSelected = selectedTeam === t.name;
        const isDimmed = selectedTeam && !isSelected;

        return (
          <Col xs={12} sm={12} md={6} key={t.id}>
            <Tooltip
              title={
                onTeamClick
                  ? isSelected
                    ? 'Click again to clear filter'
                    : `Click to view ${t.name}'s players`
                  : null
              }
              mouseEnterDelay={0.4}
            >
              <Card
                size="small"
                onClick={() => handleClick(t.name)}
                hoverable={!!onTeamClick}
                style={{
                  borderRadius: 12,
                  borderTop: `4px solid ${t.color}`,
                  borderLeft: isSelected ? `2px solid ${t.color}` : undefined,
                  borderRight: isSelected ? `2px solid ${t.color}` : undefined,
                  borderBottom: isSelected ? `2px solid ${t.color}` : undefined,
                  background: isSelected ? `${t.color}10` : '#fff',
                  opacity: isDimmed ? 0.55 : 1,
                  transition: 'opacity 0.15s, background 0.15s',
                  cursor: onTeamClick ? 'pointer' : 'default',
                }}
                styles={{ body: { padding: 14 } }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 6,
                  }}
                >
                  <Text strong style={{ color: t.color, fontSize: 15 }}>
                    {t.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                    {count} {count === 1 ? 'player' : 'players'}
                  </Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#8c8c8c',
                    marginBottom: 4,
                  }}
                >
                  <span>Spent {formatPrice(spent)}</span>
                  <span style={{ fontWeight: 600, color: '#262626' }}>
                    {formatPrice(remaining)} left
                  </span>
                </div>
                <Progress
                  percent={pct}
                  size="small"
                  strokeColor={t.color}
                  showInfo={false}
                />
              </Card>
            </Tooltip>
          </Col>
        );
      })}
    </Row>
  );
}

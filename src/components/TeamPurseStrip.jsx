import { Row, Col, Card, Typography, Progress, Tooltip, Tag } from 'antd';
import {
  TeamOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';
import useCollapsibleState from '../hooks/useCollapsibleState';

const { Text, Title } = Typography;

export default function TeamPurseStrip({ selectedTeam = null, onTeamClick }) {
  const { teams, teamStats } = useLeague();
  const [collapsed, toggle] = useCollapsibleState('team-purses', true);

  const handleClick = (teamName) => {
    if (!onTeamClick) return;
    // Click the same team again to clear the filter.
    onTeamClick(selectedTeam === teamName ? null : teamName);
  };

  const ChevronIcon = collapsed ? RightOutlined : DownOutlined;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={!collapsed}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: collapsed ? 0 : 16,
          cursor: 'pointer',
          userSelect: 'none',
          flexWrap: 'wrap',
        }}
      >
        <ChevronIcon style={{ fontSize: 18, color: '#1677ff' }} />
        <TeamOutlined style={{ fontSize: 26, color: '#1677ff' }} />
        <Title level={2} style={{ margin: 0, fontSize: 24 }}>
          Team Purses
        </Title>
        <Tag
          style={{
            fontSize: 13,
            padding: '2px 10px',
            borderRadius: 10,
            fontWeight: 600,
            background: '#1677ff15',
            color: '#1677ff',
            borderColor: '#1677ff55',
          }}
        >
          {teams.length} teams
        </Tag>
        {selectedTeam && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Filtering players by <strong>{selectedTeam}</strong>
          </Text>
        )}
      </div>

      {!collapsed && (
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
      )}
    </div>
  );
}

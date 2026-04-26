import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Progress,
  Empty,
  Space,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';

const { Title, Text } = Typography;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

export default function TeamsPage() {
  const navigate = useNavigate();
  const { teams, teamStats } = useLeague();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
          Teams
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          {teams.length} teams competing in the Aethereus Premier League
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {teams.map((team) => {
          const stats = teamStats[team.name];
          const pct = stats
            ? Math.round((stats.spent / team.totalPurse) * 100)
            : 0;
          return (
            <Col xs={24} md={12} key={team.id}>
              <Card
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div
                  style={{
                    height: 8,
                    background: `linear-gradient(90deg, ${team.color}, ${team.color}88)`,
                  }}
                />
                <div style={{ padding: '20px 24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Title
                      level={4}
                      style={{ margin: 0, color: team.color }}
                    >
                      {team.name}
                    </Title>
                    <Tag
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        color: team.color,
                        borderColor: team.color,
                        background: `${team.color}10`,
                      }}
                    >
                      {stats?.count ?? 0} Players
                    </Tag>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Purse Used
                      </Text>
                      <Text strong style={{ fontSize: 12 }}>
                        {formatPrice(stats?.spent ?? 0)} /{' '}
                        {formatPrice(team.totalPurse)}
                      </Text>
                    </div>
                    <Progress
                      percent={pct}
                      strokeColor={team.color}
                      size="small"
                      showInfo={false}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Remaining: {formatPrice(stats?.remaining ?? team.totalPurse)}
                    </Text>
                  </div>

                  {stats?.roster.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {stats.roster.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/players/${p.id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: '#fafafa',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = '#f0f0f0')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = '#fafafa')
                          }
                        >
                          <Avatar
                            src={p.photo}
                            icon={<UserOutlined />}
                            size={32}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.name}
                            </Text>
                          </div>
                          <Tag
                            color={ROLE_COLORS[p.role]}
                            style={{
                              borderRadius: 10,
                              fontSize: 11,
                            }}
                          >
                            {p.role}
                          </Tag>
                          <Text
                            strong
                            style={{
                              fontSize: 12,
                              color: '#52c41a',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatPrice(p.price)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      description="No players yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ margin: '16px 0' }}
                    />
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

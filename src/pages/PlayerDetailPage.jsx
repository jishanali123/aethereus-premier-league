import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Typography,
  Descriptions,
  Statistic,
  Row,
  Col,
  Badge,
  Button,
  Result,
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';

const { Title, Text, Paragraph } = Typography;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

const TEAM_COLORS = {
  'Royal Strikers': '#1677ff',
  'Thunder Kings': '#faad14',
  'Blaze Warriors': '#ff4d4f',
  'Supreme Challengers': '#722ed1',
};

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { players } = useLeague();

  const player = useMemo(
    () => players.find((p) => p.id === Number(id)) ?? null,
    [players, id],
  );

  if (!player) {
    return (
      <div style={{ maxWidth: 600, margin: '48px auto', padding: '0 24px' }}>
        <Result
          status="404"
          title="Player Not Found"
          subTitle={`No player exists with ID "${id}".`}
          extra={
            <Button type="primary" onClick={() => navigate('/players')}>
              Back to Roster
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/players')}
        style={{ padding: '4px 0', marginBottom: 16 }}
      >
        Back to Roster
      </Button>

      {/* Hero section */}
      <Card
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${TEAM_COLORS[player.team] || '#1a1a2e'}22 0%, ${TEAM_COLORS[player.team] || '#0f3460'}33 100%)`,
            padding: '32px 32px 24px',
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
              <Avatar
                src={player.photo}
                icon={<UserOutlined />}
                size={140}
                style={{
                  border: '4px solid #fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              />
            </Col>
            <Col xs={24} sm={16} md={18}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Title level={2} style={{ margin: 0 }}>
                  {player.name}
                </Title>
                <Badge
                  status={player.sold ? 'success' : 'warning'}
                  text={
                    <span style={{ fontWeight: 500 }}>
                      {player.sold ? 'Sold' : 'Available'}
                    </span>
                  }
                />
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Tag
                  color={ROLE_COLORS[player.role]}
                  style={{
                    fontSize: 14,
                    padding: '2px 12px',
                    borderRadius: 12,
                  }}
                >
                  {player.role}
                </Tag>
                {player.team && (
                  <Tag
                    color={TEAM_COLORS[player.team]}
                    style={{
                      fontSize: 14,
                      padding: '2px 12px',
                      borderRadius: 12,
                      fontWeight: 500,
                    }}
                  >
                    {player.team}
                  </Tag>
                )}
              </div>
              <Paragraph
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  fontSize: 15,
                  color: '#595959',
                }}
              >
                {player.description}
              </Paragraph>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Stats cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="Matches"
              value={player.matches}
              prefix={<TrophyOutlined />}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="Runs"
              value={player.runs}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ fontSize: 22, color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="Wickets"
              value={player.wickets}
              prefix={<AimOutlined />}
              valueStyle={{ fontSize: 22, color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="Bat Avg"
              value={player.battingAvg ?? '-'}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="Bowl Avg"
              value={player.bowlingAvg ?? '-'}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="SR"
              value={player.strikeRate}
              valueStyle={{ fontSize: 22, color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Details table */}
      <Card
        title="Auction & Profile Details"
        style={{ borderRadius: 16 }}
        styles={{ header: { borderBottom: '1px solid #f0f0f0' } }}
      >
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          layout="vertical"
          colon={false}
        >
          <Descriptions.Item label="Sold Price">
            <Text
              strong
              style={{
                fontSize: 18,
                color: player.sold ? '#52c41a' : '#faad14',
              }}
            >
              <DollarOutlined style={{ marginRight: 4 }} />
              {formatPrice(player.price)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Base Price">
            <Text style={{ fontSize: 16 }}>
              {formatPrice(player.basePrice)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={ROLE_COLORS[player.role]}>{player.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Team">
            {player.team ? (
              <Tag
                color={TEAM_COLORS[player.team]}
                style={{ fontWeight: 500 }}
              >
                {player.team}
              </Tag>
            ) : (
              <Text type="secondary">Unassigned</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={player.sold ? 'success' : 'warning'}
              text={player.sold ? 'Sold' : 'Available for Auction'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Matches Played">
            <Text>{player.matches}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

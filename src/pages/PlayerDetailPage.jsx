import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Badge,
  Button,
  Result,
  Avatar,
  Rate,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
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

      {/* ---- SECTION 1: Player Profile ---- */}
      <Card
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Hero header */}
        <div
          style={{
            background: player.team
              ? `linear-gradient(135deg, ${TEAM_COLORS[player.team]}22 0%, ${TEAM_COLORS[player.team]}33 100%)`
              : 'linear-gradient(135deg, #1a1a2e22 0%, #0f346033 100%)',
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
              <Title level={2} style={{ margin: '0 0 8px' }}>
                {player.name}
              </Title>
              <div
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
              >
                <Tag
                  color={ROLE_COLORS[player.role]}
                  style={{ fontSize: 14, padding: '2px 12px', borderRadius: 12 }}
                >
                  {player.role}
                </Tag>
              </div>
              {player.description && (
                <Paragraph
                  style={{ marginBottom: 0, fontSize: 15, color: '#595959' }}
                >
                  {player.description}
                </Paragraph>
              )}
            </Col>
          </Row>
        </div>

        {/* Ratings */}
        <div style={{ padding: '20px 32px' }}>
          <Row gutter={[32, 16]}>
            <Col xs={12}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Batting Rating
              </Text>
              <Rate disabled value={player.battingRating ?? 0} count={5} />
              <Text strong style={{ marginLeft: 8, fontSize: 16 }}>
                {player.battingRating ?? 0}/5
              </Text>
            </Col>
            <Col xs={12}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Bowling Rating
              </Text>
              <Rate disabled value={player.bowlingRating ?? 0} count={5} />
              <Text strong style={{ marginLeft: 8, fontSize: 16 }}>
                {player.bowlingRating ?? 0}/5
              </Text>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ---- SECTION 2: Auction Details ---- */}
      <Card
        style={{ borderRadius: 16 }}
        styles={{ header: { borderBottom: '1px solid #f0f0f0' } }}
        title={
          <span>
            <DollarOutlined style={{ marginRight: 8, color: '#faad14' }} />
            Auction Details
          </span>
        }
      >
        {player.sold ? (
          <>
            <Row gutter={[24, 20]}>
              <Col xs={12} sm={6}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  STATUS
                </Text>
                <Badge
                  status="success"
                  text={<Text strong style={{ color: '#52c41a' }}>Sold</Text>}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  SOLD PRICE
                </Text>
                <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
                  {formatPrice(player.price)}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  BASE PRICE
                </Text>
                <Text style={{ fontSize: 16 }}>
                  {formatPrice(player.basePrice)}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  TEAM
                </Text>
                {player.team ? (
                  <Tag
                    color={TEAM_COLORS[player.team]}
                    style={{ fontWeight: 500, fontSize: 14, padding: '2px 12px', borderRadius: 12 }}
                  >
                    {player.team}
                  </Tag>
                ) : (
                  <Text type="secondary">Unassigned</Text>
                )}
              </Col>
            </Row>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Badge
              status="warning"
              text={
                <Text strong style={{ fontSize: 15 }}>
                  Available for Auction
                </Text>
              }
            />
            <Divider style={{ margin: '16px 0' }} />
            <Text type="secondary">Base Price: </Text>
            <Text strong style={{ fontSize: 18 }}>
              {formatPrice(player.basePrice)}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}

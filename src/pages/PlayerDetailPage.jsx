import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
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
  LinkOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';
import SalePanel from '../components/SalePanel';

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
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 32px 48px' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/players')}
        style={{ padding: '4px 0', marginBottom: 16, fontSize: 16 }}
      >
        Back to Roster
      </Button>

      {/* ---- SECTION 1: Player Profile ---- */}
      <Card
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 28,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Hero header */}
        <div
          style={{
            background: player.team
              ? `linear-gradient(135deg, ${TEAM_COLORS[player.team]}22 0%, ${TEAM_COLORS[player.team]}33 100%)`
              : 'linear-gradient(135deg, #1a1a2e22 0%, #0f346033 100%)',
            padding: '48px 48px 36px',
          }}
        >
          <Row gutter={[40, 32]} align="middle">
            <Col xs={24} sm={8} md={7} lg={6} style={{ textAlign: 'center' }}>
              <Avatar
                src={player.photo}
                icon={<UserOutlined />}
                size={240}
                style={{
                  border: '6px solid #fff',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.16)',
                }}
              />
            </Col>
            <Col xs={24} sm={16} md={17} lg={18}>
              <Title level={1} style={{ margin: '0 0 12px', fontSize: 48, lineHeight: 1.1 }}>
                {player.name}
              </Title>
              <div
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}
              >
                <Tag
                  color={ROLE_COLORS[player.role]}
                  style={{ fontSize: 18, padding: '6px 18px', borderRadius: 14, fontWeight: 600 }}
                >
                  {player.role}
                </Tag>
              </div>
              {player.description && (
                <Paragraph
                  style={{ marginBottom: 0, fontSize: 18, color: '#595959' }}
                >
                  {player.description}
                </Paragraph>
              )}
            </Col>
          </Row>
        </div>

        {/* Ratings */}
        <div style={{ padding: '32px 48px' }}>
          <Row gutter={[40, 24]}>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                BATTING RATING
              </Text>
              <Rate disabled value={player.battingRating ?? 0} count={5} style={{ fontSize: 32 }} />
              <Text strong style={{ marginLeft: 12, fontSize: 22 }}>
                {player.battingRating ?? 0}/5
              </Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                BOWLING RATING
              </Text>
              <Rate disabled value={player.bowlingRating ?? 0} count={5} style={{ fontSize: 32 }} />
              <Text strong style={{ marginLeft: 12, fontSize: 22 }}>
                {player.bowlingRating ?? 0}/5
              </Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                FIELDING RATING
              </Text>
              <Rate disabled value={player.fieldingRating ?? 0} count={5} style={{ fontSize: 32 }} />
              <Text strong style={{ marginLeft: 12, fontSize: 22 }}>
                {player.fieldingRating ?? 0}/5
              </Text>
            </Col>
          </Row>
          {player.cricheroesUrl && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => window.open(player.cricheroesUrl, '_blank')}
                style={{
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                View CricHeroes Profile
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* ---- SECTION 2: Auction Details ---- */}
      <Card
        style={{ borderRadius: 20 }}
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', fontSize: 20, padding: '20px 32px' },
          body: { padding: '28px 32px' },
        }}
        title={
          <span>
            <DollarOutlined style={{ marginRight: 10, color: '#faad14', fontSize: 22 }} />
            Auction Details
          </span>
        }
      >
        <SalePanel player={player} />
      </Card>
    </div>
  );
}

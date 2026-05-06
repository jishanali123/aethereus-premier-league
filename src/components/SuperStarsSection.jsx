import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Avatar, Typography, Tag, Rate, Tooltip } from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';
import useCollapsibleState from '../hooks/useCollapsibleState';

const { Title, Text } = Typography;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

function MiniRating({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        fontSize: 13,
      }}
    >
      <Text type="secondary" style={{ fontSize: 12, fontWeight: 500, minWidth: 48 }}>
        {label}
      </Text>
      <Rate disabled value={value ?? 0} count={5} style={{ fontSize: 14 }} />
    </div>
  );
}

export default function SuperStarsSection() {
  const { players } = useLeague();
  const navigate = useNavigate();
  const [collapsed, toggle] = useCollapsibleState('super-stars', true);

  const superStars = useMemo(
    () =>
      players
        .filter(
          (p) =>
            p.battingRating === 5 &&
            p.bowlingRating === 5 &&
            p.fieldingRating === 5,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [players],
  );

  if (superStars.length === 0) return null;

  const ChevronIcon = collapsed ? RightOutlined : DownOutlined;

  return (
    <div style={{ marginBottom: 36 }}>
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
        }}
      >
        <ChevronIcon style={{ fontSize: 18, color: '#faad14' }} />
        <CrownOutlined style={{ fontSize: 28, color: '#faad14' }} />
        <Title level={2} style={{ margin: 0, fontSize: 28 }}>
          Super Stars
        </Title>
        <Tag
          color="gold"
          style={{
            fontSize: 13,
            padding: '2px 10px',
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          5 / 5 / 5
        </Tag>
        <Text type="secondary" style={{ fontSize: 15 }}>
          {superStars.length} elite all-round talents
        </Text>
      </div>

      {!collapsed && (
      <Row gutter={[20, 20]}>
        {superStars.map((p) => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              onClick={() => navigate(`/players/${p.id}`)}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '2px solid #faad14',
                background:
                  'linear-gradient(135deg, #fffbe6 0%, #fff7d6 100%)',
                height: '100%',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Tooltip title="5★ in Batting, Bowling and Fielding">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={p.photo}
                      icon={<UserOutlined />}
                      size={88}
                      style={{
                        border: '3px solid #faad14',
                        boxShadow: '0 2px 12px rgba(250, 173, 20, 0.35)',
                      }}
                    />
                    <CrownOutlined
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#faad14',
                        color: '#fff',
                        fontSize: 16,
                        padding: 6,
                        borderRadius: '50%',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    />
                  </div>
                </Tooltip>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <Text
                  strong
                  style={{
                    fontSize: 16,
                    display: 'block',
                    lineHeight: 1.2,
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </Text>
                <Tag
                  color={ROLE_COLORS[p.role] || 'default'}
                  style={{ fontSize: 12, padding: '0 8px', borderRadius: 8 }}
                >
                  {p.role}
                </Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MiniRating label="Bat" value={p.battingRating} />
                <MiniRating label="Bowl" value={p.bowlingRating} />
                <MiniRating label="Field" value={p.fieldingRating} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      )}
    </div>
  );
}

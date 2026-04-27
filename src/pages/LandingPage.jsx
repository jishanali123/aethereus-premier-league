import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Statistic, Typography } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';

const { Title, Text } = Typography;

export default function LandingPage() {
  const navigate = useNavigate();
  const { players, teams, sponsors } = useLeague();

  const soldCount = players.filter((p) => p.sold).length;
  const totalRuns = players.reduce((s, p) => s + p.runs, 0);
  const totalWickets = players.reduce((s, p) => s + p.wickets, 0);

  return (
    <div>
      {/* Hero: banner + stats + CTA all in one viewport */}
      <div
        style={{
          background:
            'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 60%, #f5f5f5 100%)',
          padding: '16px 24px 48px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Banner image — contained, not full-bleed */}
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              marginBottom: 20,
            }}
          >
            <img
              src="/images/apl-banner.png"
              alt="Aethereus Premier League"
              style={{
                width: '100%',
                maxHeight: '40vh',
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
              }}
            />
          </div>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              disabled
              className="coming-soon-btn"
              style={{
                height: 44,
                paddingInline: 28,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 22,
              }}
            >
              Auction — Coming Soon
            </Button>
            <Button
              size="large"
              icon={<TeamOutlined />}
              onClick={() => navigate('/players')}
              style={{
                height: 44,
                paddingInline: 28,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 22,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              View Players
            </Button>
          </div>

          {/* Stats row */}
          <Row gutter={[12, 12]}>
            {[
              {
                title: 'Players',
                value: players.length,
                icon: <TeamOutlined />,
                color: '#1677ff',
              },
              {
                title: 'Sold',
                value: soldCount,
                suffix: `/ ${players.length}`,
                icon: <TrophyOutlined />,
                color: '#52c41a',
              },
              {
                title: 'Total Runs',
                value: totalRuns,
                icon: <ThunderboltOutlined />,
                color: '#faad14',
              },
              {
                title: 'Wickets',
                value: totalWickets,
                icon: <ThunderboltOutlined />,
                color: '#ff4d4f',
              },
            ].map((stat) => (
              <Col xs={12} sm={6} key={stat.title}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    textAlign: 'center',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                  styles={{ body: { padding: '12px 8px' } }}
                >
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.icon}
                    valueStyle={{
                      color: stat.color,
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Below-the-fold content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 32px' }}>
        {/* Teams */}
        <Title level={3} style={{ marginTop: 16, marginBottom: 16 }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
          Competing Teams
        </Title>
        <Row gutter={[16, 16]}>
          {teams.map((team) => {
            const roster = players.filter((p) => p.team === team.name);
            return (
              <Col xs={12} sm={6} key={team.id}>
                <Card
                  hoverable
                  onClick={() => navigate('/teams')}
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div style={{ height: 6, background: team.color }} />
                  <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <Title
                      level={5}
                      style={{
                        margin: '0 0 4px',
                        color: team.color,
                        fontSize: 15,
                      }}
                    >
                      {team.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {roster.length} players
                    </Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Secondary banner */}
        <div style={{ marginTop: 32 }}>
          <img
            src="/images/apl-banner-2.png"
            alt="Aethereus Premier League — Get ready for intense matches"
            style={{
              width: '100%',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              display: 'block',
            }}
          />
        </div>

        {/* Sponsors Preview */}
        {sponsors.length > 0 && (
          <>
            <Title level={3} style={{ marginTop: 32, marginBottom: 16 }}>
              <GiftOutlined style={{ marginRight: 8, color: '#722ed1' }} />
              Our Sponsors
            </Title>
            <Row gutter={[16, 16]}>
              {sponsors
                .filter((s) => s.tier === 'title' || s.tier === 'gold')
                .map((s) => (
                  <Col xs={12} sm={8} key={s.id}>
                    <Card
                      hoverable
                      onClick={() => navigate('/sponsors')}
                      style={{
                        borderRadius: 16,
                        textAlign: 'center',
                        border: 'none',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      }}
                    >
                      {s.logo ? (
                        <img
                          src={s.logo}
                          alt={s.name}
                          style={{
                            maxHeight: 60,
                            maxWidth: '80%',
                            objectFit: 'contain',
                            marginBottom: 8,
                          }}
                        />
                      ) : null}
                      <Text
                        strong
                        style={{
                          fontSize: s.tier === 'title' ? 16 : 14,
                          color: s.tier === 'title' ? '#722ed1' : undefined,
                          display: 'block',
                        }}
                      >
                        {s.name}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        {s.tier} sponsor
                      </Text>
                    </Card>
                  </Col>
                ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button type="link" onClick={() => navigate('/sponsors')}>
                View all sponsors →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

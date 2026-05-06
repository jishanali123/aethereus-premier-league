import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Statistic, Typography } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';

const { Title, Text } = Typography;

export default function LandingPage() {
  const navigate = useNavigate();
  const { players, teams, sponsors } = useLeague();

  const soldCount = players.filter((p) => p.sold).length;
  const sponsorCount = sponsors.length;

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
                title: 'Teams',
                value: teams.length,
                icon: <TrophyOutlined />,
                color: '#52c41a',
              },
              {
                title: 'Sponsors',
                value: sponsorCount,
                icon: <GiftOutlined />,
                color: '#faad14',
              },
              {
                title: 'Auction',
                value: soldCount,
                suffix: `/ ${players.length}`,
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

        {/* Sponsors Preview — tiered hierarchy */}
        {sponsors.length > 0 && (() => {
          const titleSponsor = sponsors.find((s) => s.tier === 'title');
          const coTitleSponsors = sponsors.filter((s) => s.tier === 'co-title');
          const teamSponsors = sponsors.filter((s) => s.tier === 'team-sponsor');

          const TIER_STYLES = {
            title: {
              bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 60%, #3d1f6d 100%)',
              border: 'none',
              shadow: '0 8px 32px rgba(29,0,66,0.3)',
              nameColor: '#fff',
              labelColor: 'rgba(255,255,255,0.7)',
              badgeBg: 'linear-gradient(90deg, #b88aed, #f0c27f)',
              badgeColor: '#1a0a2e',
              logoFilter: 'brightness(0) invert(1)',
              logoBg: 'rgba(255,255,255,0.12)',
            },
            'co-title': {
              bg: 'linear-gradient(135deg, #0a2e2a 0%, #0e3d38 60%, #145550 100%)',
              border: 'none',
              shadow: '0 6px 28px rgba(10,46,42,0.3)',
              nameColor: '#5cdbd3',
              labelColor: 'rgba(92,219,211,0.7)',
              badgeBg: 'linear-gradient(90deg, #36cfc9, #13c2c2)',
              badgeColor: '#0a2e2a',
              logoFilter: 'none',
              logoBg: 'rgba(255,255,255,0.9)',
            },
            default: {
              bg: '#fff',
              border: 'none',
              shadow: '0 2px 16px rgba(0,0,0,0.08)',
              nameColor: '#08979c',
              labelColor: '#8c8c8c',
              badgeBg: '#08979c',
              badgeColor: '#fff',
              logoFilter: 'none',
              logoBg: 'transparent',
            },
          };

          const SponsorCard = ({ sponsor, tierLabel, large }) => {
            const hasLink = sponsor.website && sponsor.website !== '#';
            const ts = TIER_STYLES[sponsor.tier] || TIER_STYLES.default;
            const isDark = sponsor.tier === 'title' || sponsor.tier === 'co-title';
            return (
              <Card
                hoverable
                onClick={() =>
                  hasLink
                    ? window.open(sponsor.website, '_blank', 'noopener,noreferrer')
                    : navigate('/sponsors')
                }
                style={{
                  borderRadius: 16,
                  textAlign: 'center',
                  border: ts.border,
                  background: ts.bg,
                  boxShadow: ts.shadow,
                  height: '100%',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: large ? '32px 24px' : '20px 16px' } }}
              >
                {sponsor.logo && (
                  <div
                    style={{
                      background: isDark ? ts.logoBg : 'transparent',
                      borderRadius: 12,
                      padding: isDark ? 12 : 0,
                      display: 'inline-block',
                      marginBottom: 12,
                    }}
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: large ? 100 : 64,
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    fontSize: large ? 20 : 14,
                    fontWeight: large ? 800 : 600,
                    color: ts.nameColor,
                    marginBottom: 6,
                  }}
                >
                  {sponsor.name}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    background: ts.badgeBg,
                    color: ts.badgeColor,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    padding: '3px 12px',
                    borderRadius: 20,
                  }}
                >
                  {tierLabel}
                </span>
              </Card>
            );
          };

          return (
            <>
              <Title level={3} style={{ marginTop: 32, marginBottom: 16 }}>
                <GiftOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Our Sponsors
              </Title>

              {/* Title Sponsor — full width, dark premium */}
              {titleSponsor && (
                <div style={{ marginBottom: 16 }}>
                  <SponsorCard
                    sponsor={titleSponsor}
                    tierLabel="Title Sponsor"
                    large
                  />
                </div>
              )}

              {/* Co-Title Sponsors — side by side */}
              {coTitleSponsors.length > 0 && (
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {coTitleSponsors.map((s) => (
                    <Col xs={24} sm={12} key={s.id}>
                      <SponsorCard
                        sponsor={s}
                        tierLabel="Co-Title Sponsor"
                        large
                      />
                    </Col>
                  ))}
                </Row>
              )}

              {/* Team Sponsors row — clean white */}
              {teamSponsors.length > 0 && (
                <Row gutter={[12, 12]}>
                  {teamSponsors.map((s) => (
                    <Col xs={8} sm={8} key={s.id}>
                      <SponsorCard
                        sponsor={s}
                        tierLabel="Team Sponsor"
                      />
                    </Col>
                  ))}
                </Row>
              )}

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => navigate('/sponsors')}>
                  View all sponsors →
                </Button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

import {
  Typography,
  Card,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  GiftOutlined,
  GlobalOutlined,
  CrownOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';

const { Title, Text, Paragraph } = Typography;

const TIER_CONFIG = {
  title: {
    icon: <CrownOutlined />,
    label: 'Title Sponsor',
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 60%, #3d1f6d 100%)',
    shadow: '0 8px 32px rgba(29,0,66,0.3)',
    nameColor: '#fff',
    descColor: 'rgba(255,255,255,0.6)',
    badgeBg: 'linear-gradient(90deg, #b88aed, #f0c27f)',
    badgeColor: '#1a0a2e',
    linkColor: 'rgba(255,255,255,0.7)',
    logoBg: 'rgba(255,255,255,0.12)',
    sectionColor: '#722ed1',
  },
  'co-title': {
    icon: <StarOutlined />,
    label: 'Co-Title Sponsor',
    bg: 'linear-gradient(135deg, #0a2e2a 0%, #0e3d38 60%, #145550 100%)',
    shadow: '0 6px 28px rgba(10,46,42,0.3)',
    nameColor: '#5cdbd3',
    descColor: 'rgba(92,219,211,0.6)',
    badgeBg: 'linear-gradient(90deg, #36cfc9, #13c2c2)',
    badgeColor: '#0a2e2a',
    linkColor: 'rgba(92,219,211,0.7)',
    logoBg: 'rgba(255,255,255,0.9)',
    sectionColor: '#13c2c2',
  },
  'team-sponsor': {
    icon: <TeamOutlined />,
    label: 'Team Sponsor',
    bg: '#fff',
    shadow: '0 2px 16px rgba(0,0,0,0.08)',
    nameColor: '#08979c',
    descColor: '#8c8c8c',
    badgeBg: '#08979c',
    badgeColor: '#fff',
    linkColor: '#08979c',
    logoBg: 'transparent',
    sectionColor: '#08979c',
  },
};

function openLink(url) {
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function SponsorsPage() {
  const { sponsors } = useLeague();

  const grouped = {
    title: sponsors.filter((s) => s.tier === 'title'),
    'co-title': sponsors.filter((s) => s.tier === 'co-title'),
    'team-sponsor': sponsors.filter((s) => s.tier === 'team-sponsor'),
  };

  const renderSponsorCard = (sponsor, size = 'default') => {
    const tier = TIER_CONFIG[sponsor.tier] || TIER_CONFIG['team-sponsor'];
    const isLarge = size === 'large';
    const isDark = sponsor.tier === 'title' || sponsor.tier === 'co-title';
    const hasLink = sponsor.website && sponsor.website !== '#';

    return (
      <Card
        key={sponsor.id}
        hoverable={hasLink}
        onClick={() => openLink(sponsor.website)}
        style={{
          borderRadius: 16,
          border: 'none',
          background: tier.bg,
          height: '100%',
          cursor: hasLink ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: tier.shadow,
          overflow: 'hidden',
        }}
        styles={{ body: { padding: isLarge ? '36px 28px' : '24px 20px' } }}
      >
        <div style={{ textAlign: 'center' }}>
          {sponsor.logo && (
            <div
              style={{
                background: isDark ? tier.logoBg : 'transparent',
                borderRadius: 12,
                padding: isDark ? 16 : 0,
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                style={{
                  maxWidth: '80%',
                  maxHeight: isLarge ? 140 : 80,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          )}
          <div
            style={{
              fontSize: isLarge ? 22 : 16,
              fontWeight: isLarge ? 800 : 600,
              color: tier.nameColor,
              margin: '0 0 8px',
            }}
          >
            {sponsor.name}
          </div>
          <span
            style={{
              display: 'inline-block',
              background: tier.badgeBg,
              color: tier.badgeColor,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              padding: '3px 14px',
              borderRadius: 20,
            }}
          >
            {tier.label}
          </span>
          <Paragraph
            style={{ margin: '14px 0 0', fontSize: 13, color: tier.descColor }}
          >
            {sponsor.description}
          </Paragraph>
          {hasLink && (
            <Text
              style={{ fontSize: 12, marginTop: 4, display: 'block', color: tier.linkColor }}
            >
              <GlobalOutlined style={{ marginRight: 4 }} />
              Visit Website
            </Text>
          )}
        </div>
      </Card>
    );
  };

  const renderTierSection = (tierKey) => {
    const tier = TIER_CONFIG[tierKey];
    const items = grouped[tierKey];
    if (!items || !items.length) return null;

    const isTitle = tierKey === 'title';
    const isCoTitle = tierKey === 'co-title';
    const isFeatureTier = isTitle || isCoTitle;
    const colSpan = isTitle
      ? { xs: 24 }
      : isCoTitle
        ? { xs: 24, sm: 12 }
        : { xs: 24, sm: 12, md: 8 };

    return (
      <div key={tierKey} style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ color: tier.sectionColor, fontSize: 20 }}>{tier.icon}</span>
          <Title level={4} style={{ margin: 0, color: tier.sectionColor }}>
            {items.length > 1 ? `${tier.label}s` : tier.label}
          </Title>
        </div>
        <Row gutter={[16, 16]} justify={isTitle ? 'center' : 'start'}>
          {items.map((s) => (
            <Col key={s.id} {...colSpan} style={isTitle ? { maxWidth: 600 } : undefined}>
              {renderSponsorCard(s, isFeatureTier ? 'large' : 'default')}
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          <GiftOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          Our Sponsors
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          The partners who make Aethereus Premier League possible
        </Text>
      </div>

      {sponsors.length === 0 ? (
        <Empty description="No sponsors yet" style={{ padding: 80 }} />
      ) : (
        <>
          {renderTierSection('title')}
          {renderTierSection('co-title')}
          {renderTierSection('team-sponsor')}
        </>
      )}
    </div>
  );
}

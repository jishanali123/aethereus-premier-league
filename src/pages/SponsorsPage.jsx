import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Empty,
} from 'antd';
import {
  GiftOutlined,
  GlobalOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';

const { Title, Text, Paragraph } = Typography;

const TIER_CONFIG = {
  title: {
    color: '#722ed1',
    icon: <CrownOutlined />,
    label: 'Title Sponsor',
    bg: 'linear-gradient(135deg, #f5f0ff 0%, #efdbff 100%)',
    border: '#d3adf7',
  },
  gold: {
    color: '#faad14',
    icon: <StarOutlined />,
    label: 'Gold Sponsor',
    bg: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)',
    border: '#ffe58f',
  },
  silver: {
    color: '#8c8c8c',
    icon: <GiftOutlined />,
    label: 'Silver Sponsor',
    bg: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    border: '#d9d9d9',
  },
};

export default function SponsorsPage() {
  const { sponsors } = useLeague();

  const grouped = {
    title: sponsors.filter((s) => s.tier === 'title'),
    gold: sponsors.filter((s) => s.tier === 'gold'),
    silver: sponsors.filter((s) => s.tier === 'silver'),
  };

  const renderSponsorCard = (sponsor) => {
    const tier = TIER_CONFIG[sponsor.tier] || TIER_CONFIG.silver;
    return (
      <Card
        key={sponsor.id}
        style={{
          borderRadius: 16,
          border: `1px solid ${tier.border}`,
          background: tier.bg,
          height: '100%',
        }}
        styles={{ body: { padding: '24px 20px' } }}
      >
        <div style={{ textAlign: 'center' }}>
          {sponsor.logo ? (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                padding: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: 28,
                color: tier.color,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {tier.icon}
            </div>
          )}
          <Title level={5} style={{ margin: '0 0 4px', color: tier.color }}>
            {sponsor.name}
          </Title>
          <Tag
            color={tier.color}
            style={{
              borderRadius: 12,
              textTransform: 'uppercase',
              fontSize: 11,
              letterSpacing: 0.5,
            }}
          >
            {tier.label}
          </Tag>
          <Paragraph
            type="secondary"
            style={{ margin: '12px 0 0', fontSize: 13 }}
          >
            {sponsor.description}
          </Paragraph>
          {sponsor.website && sponsor.website !== '#' && (
            <Button
              type="link"
              icon={<GlobalOutlined />}
              href={sponsor.website}
              target="_blank"
              size="small"
              style={{ marginTop: 8 }}
            >
              Visit Website
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const renderTierSection = (tierKey) => {
    const tier = TIER_CONFIG[tierKey];
    const items = grouped[tierKey];
    if (!items.length) return null;

    const colSpan =
      tierKey === 'title'
        ? { xs: 24, sm: 24, md: 12, lg: 8 }
        : { xs: 24, sm: 12, md: 8 };

    return (
      <div key={tierKey} style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ color: tier.color, fontSize: 20 }}>{tier.icon}</span>
          <Title level={4} style={{ margin: 0, color: tier.color }}>
            {tier.label}s
          </Title>
        </div>
        <Row gutter={[16, 16]}>
          {items.map((s) => (
            <Col key={s.id} {...colSpan}>
              {renderSponsorCard(s)}
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
          {renderTierSection('gold')}
          {renderTierSection('silver')}
        </>
      )}
    </div>
  );
}

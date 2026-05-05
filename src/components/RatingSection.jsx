import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Avatar, Typography, Tag, Rate, Badge } from 'antd';
import { UserOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';
import useCollapsibleState from '../hooks/useCollapsibleState';

const { Title, Text } = Typography;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

/**
 * A compact "feature wall" of player cards filtered by some criterion.
 *
 * Props:
 *  - title: Section heading.
 *  - icon:  React node rendered before the title.
 *  - accent: Hex color used for the card border / tint and the primary rating.
 *  - subtitle: Optional small caption next to the count.
 *  - primaryStat: 'battingRating' | 'bowlingRating' | 'fieldingRating'
 *      The rating to render large + use as the primary sort key.
 *  - filter: Predicate (player) => boolean — which players to include.
 *  - storageKey: optional id used to persist collapsed state per section.
 *  - defaultCollapsed: initial open/closed state before user toggles.
 */
export default function RatingSection({
  title,
  icon,
  accent,
  subtitle,
  primaryStat,
  filter,
  storageKey,
  defaultCollapsed = false,
}) {
  const { players, teams } = useLeague();
  const navigate = useNavigate();
  const [collapsed, toggle] = useCollapsibleState(storageKey, defaultCollapsed);

  const teamColorByName = useMemo(() => {
    const m = {};
    for (const t of teams) m[t.name] = t.color;
    return m;
  }, [teams]);

  const featured = useMemo(() => {
    return players
      .filter(filter)
      .sort((a, b) => {
        const aPrimary = a[primaryStat] ?? 0;
        const bPrimary = b[primaryStat] ?? 0;
        if (bPrimary !== aPrimary) return bPrimary - aPrimary;
        const aField = a.fieldingRating ?? 0;
        const bField = b.fieldingRating ?? 0;
        if (bField !== aField) return bField - aField;
        return a.name.localeCompare(b.name);
      });
  }, [players, filter, primaryStat]);

  if (featured.length === 0) return null;

  const ChevronIcon = collapsed ? RightOutlined : DownOutlined;

  return (
    <div style={{ marginTop: 36 }}>
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: collapsed ? 0 : 16,
          flexWrap: 'wrap',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        aria-expanded={!collapsed}
      >
        <ChevronIcon style={{ fontSize: 18, color: accent }} />
        {icon}
        <Title level={2} style={{ margin: 0, fontSize: 28 }}>
          {title}
        </Title>
        <Tag
          style={{
            fontSize: 13,
            padding: '2px 10px',
            borderRadius: 10,
            fontWeight: 600,
            background: `${accent}15`,
            color: accent,
            borderColor: `${accent}55`,
          }}
        >
          {featured.length} players
        </Tag>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </div>

      {!collapsed && (
      <Row gutter={[16, 16]}>
        {featured.map((p) => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              onClick={() => navigate(`/players/${p.id}`)}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${accent}55`,
                background: `linear-gradient(135deg, ${accent}08 0%, #ffffff 60%)`,
                height: '100%',
              }}
              styles={{ body: { padding: 14 } }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Avatar
                  src={p.photo}
                  icon={<UserOutlined />}
                  size={56}
                  style={{ border: `2px solid ${accent}`, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 15,
                      display: 'block',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={p.name}
                  >
                    {p.name}
                  </Text>
                  <Tag
                    color={ROLE_COLORS[p.role] || 'default'}
                    style={{
                      fontSize: 11,
                      padding: '0 6px',
                      borderRadius: 6,
                      marginTop: 4,
                      marginInlineEnd: 0,
                    }}
                  >
                    {p.role}
                  </Tag>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Rate
                  disabled
                  value={p[primaryStat] ?? 0}
                  count={5}
                  style={{ fontSize: 18, color: accent }}
                />
                <Text strong style={{ fontSize: 14, color: accent }}>
                  {p[primaryStat] ?? 0}/5
                </Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: 12,
                  color: '#595959',
                  marginBottom: 8,
                }}
              >
                {primaryStat !== 'battingRating' && (
                  <span>Bat {'⭐'.repeat(p.battingRating ?? 0) || '–'}</span>
                )}
                {primaryStat !== 'bowlingRating' && (
                  <span>Bowl {'⭐'.repeat(p.bowlingRating ?? 0) || '–'}</span>
                )}
                {primaryStat !== 'fieldingRating' && (
                  <span>Field {'⭐'.repeat(p.fieldingRating ?? 0) || '–'}</span>
                )}
              </div>

              {p.sold && p.team ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 6,
                    paddingTop: 8,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Tag
                    color={teamColorByName[p.team] || 'green'}
                    style={{
                      fontSize: 11,
                      padding: '0 6px',
                      borderRadius: 6,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {p.team}
                  </Tag>
                  <Text strong style={{ fontSize: 13, color: '#52c41a' }}>
                    {formatPrice(p.price)}
                  </Text>
                </div>
              ) : (
                <div
                  style={{
                    paddingTop: 8,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Badge
                    status="warning"
                    text={
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                        Available
                      </span>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      )}
    </div>
  );
}

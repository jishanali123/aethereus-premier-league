import { useRef, useState, useCallback } from 'react';
import { Typography, Button, Space, message } from 'antd';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { toJpeg } from 'html-to-image';
import { useLeague } from '../context/LeagueContext';

const { Title, Text } = Typography;

// ---- Design tokens for the Insta post (matches Sponsor Spotlight style) ----
const POST_W = 1080;
const POST_H = 1350;

const GOLD = '#d4af37';
const GOLD_SOFT = '#f4d27a';
const GOLD_DEEP = '#a07c2c';
const NAVY_TOP = '#0a0a1f';
const NAVY_MID = '#1a0d2e';
const NAVY_BOT = '#080820';

const ROLE_BG = {
  Batsman: '#1d4ed8',
  Bowler: '#b91c1c',
  'All-Rounder': '#7c3aed',
  'Wicket-Keeper': '#15803d',
};

// Small reusable section divider with gold lines + star centerpiece
function GoldDivider({ label, accent = GOLD }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent} 60%, ${accent})`,
        }}
      />
      <span style={{ color: accent, fontSize: 14, lineHeight: 1 }}>◆</span>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          letterSpacing: 4,
          color: accent,
          fontSize: 16,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span style={{ color: accent, fontSize: 14, lineHeight: 1 }}>◆</span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(270deg, transparent, ${accent} 60%, ${accent})`,
        }}
      />
    </div>
  );
}

// One Instagram post card (1080 x 1350 px). Renders a single team's roster.
function TeamPostCard({ team, sponsor, captain, roster }) {
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Captain is shown prominently at top of the squad, then the rest in grid.
  const others = roster.filter((p) => !captain || p.id !== captain.id);

  // Pick a comfortable grid column count based on roster size so the card
  // never overflows. Up to 12 players → 4 cols; up to 8 → 4 cols; etc.
  const cols = others.length <= 6 ? 3 : 4;

  const handleDownload = useCallback(async () => {
    if (!ref.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toJpeg(ref.current, {
        cacheBust: true,
        pixelRatio: 3,
        quality: 0.98,
        width: POST_W,
        height: POST_H,
        backgroundColor: NAVY_TOP,
      });
      const link = document.createElement('a');
      const slug = team.id || team.name.replace(/\s+/g, '-').toLowerCase();
      link.download = `apl-team-${slug}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      message.error('Could not export image. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [team]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Full-size 1080x1350 canvas. On narrow viewports the page allows
          horizontal scrolling rather than shrinking the card. */}
      <div
        ref={ref}
        style={{
          width: POST_W,
          height: POST_H,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          background: `radial-gradient(ellipse at top, ${NAVY_MID} 0%, ${NAVY_TOP} 55%, ${NAVY_BOT} 100%)`,
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          flexShrink: 0,
        }}
      >
          {/* Decorative gold sparkle trails (SVG) */}
          <svg
            width={POST_W}
            height={POST_H}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id={`sg-${team.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={GOLD_SOFT} stopOpacity="0.55" />
                <stop offset="100%" stopColor={GOLD_SOFT} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="60" cy="220" r="180" fill={`url(#sg-${team.id})`} />
            <circle cx={POST_W - 60} cy="240" r="180" fill={`url(#sg-${team.id})`} />
            <circle cx="120" cy={POST_H - 220} r="220" fill={`url(#sg-${team.id})`} />
            <circle
              cx={POST_W - 120}
              cy={POST_H - 200}
              r="220"
              fill={`url(#sg-${team.id})`}
            />
            {/* Sweeping gold curves */}
            <path
              d={`M0 ${POST_H * 0.55} Q ${POST_W / 2} ${POST_H * 0.35}, ${POST_W} ${POST_H * 0.6}`}
              stroke={GOLD}
              strokeOpacity="0.18"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d={`M0 ${POST_H * 0.7} Q ${POST_W / 2} ${POST_H * 0.5}, ${POST_W} ${POST_H * 0.75}`}
              stroke={GOLD}
              strokeOpacity="0.12"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Inner gold double border frame */}
          <div
            style={{
              position: 'absolute',
              inset: 24,
              border: `2px solid ${GOLD}66`,
              borderRadius: 14,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 32,
              border: `1px solid ${GOLD}33`,
              borderRadius: 10,
              pointerEvents: 'none',
            }}
          />

          {/* ============== TOP HEADER ============== */}
          <div
            style={{
              position: 'relative',
              padding: '52px 64px 0 64px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apl-logo.png`}
              alt="APL"
              crossOrigin="anonymous"
              style={{
                height: 110,
                width: 110,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 14px rgba(212,175,55,0.4))',
              }}
            />

            <div style={{ flex: 1, textAlign: 'center', marginTop: 8 }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 800,
                  fontSize: 56,
                  letterSpacing: 4,
                  background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD}, ${GOLD_DEEP})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 0 rgba(0,0,0,0.25)',
                  lineHeight: 1,
                }}
              >
                aethereus
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: 8,
                  color: '#fff',
                }}
              >
                PREMIER LEAGUE
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: 38,
                  color: GOLD_SOFT,
                  lineHeight: 1.1,
                }}
              >
                Squad Reveal
              </div>
            </div>

            {/* Organised by ASC pseudo-badge */}
            <div
              style={{
                width: 110,
                height: 110,
                border: `2px solid ${GOLD}`,
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: GOLD_SOFT,
                  textAlign: 'center',
                }}
              >
                ORGANISED BY
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 800,
                  fontSize: 30,
                  color: '#fff',
                  letterSpacing: 2,
                  marginTop: 2,
                }}
              >
                ASC
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 7,
                  letterSpacing: 1,
                  color: GOLD_SOFT,
                  textAlign: 'center',
                  marginTop: 2,
                  lineHeight: 1.2,
                }}
              >
                AETHEREUS SPORTS
                <br />
                COMMITTEE
              </div>
            </div>
          </div>

          {/* ============== TEAM HEADER PANEL ============== */}
          <div style={{ padding: '28px 70px 0 70px', position: 'relative' }}>
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: `2px solid ${team.color}`,
                borderRadius: 16,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                position: 'relative',
                boxShadow: `0 0 30px ${team.color}40`,
              }}
            >
              {/* Sponsor logo chip */}
              {sponsor?.logo && (
                <div
                  style={{
                    width: 86,
                    height: 86,
                    background: '#fff',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${sponsor.logo.replace(/^\//, '')}`}
                    alt={team.sponsor}
                    crossOrigin="anonymous"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 800,
                    fontSize: 30,
                    color: '#fff',
                    lineHeight: 1.1,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {team.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: GOLD_SOFT,
                    letterSpacing: 0.5,
                  }}
                >
                  Sponsored by {team.sponsor}
                </div>
              </div>

              {/* Player count chip */}
              <div
                style={{
                  flexShrink: 0,
                  textAlign: 'center',
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: team.color,
                  color: '#fff',
                  minWidth: 86,
                  boxShadow: `0 4px 14px ${team.color}66`,
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                  {roster.length}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  PLAYERS
                </div>
              </div>
            </div>
          </div>

          {/* ============== CAPTAIN ============== */}
          {captain && (
            <div style={{ padding: '24px 80px 0 80px' }}>
              <GoldDivider label="CAPTAIN" accent={GOLD_SOFT} />
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 22,
                }}
              >
                <PlayerAvatar
                  player={captain}
                  size={120}
                  team={team}
                  isCaptain
                />
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 26,
                      color: '#fff',
                      letterSpacing: 1,
                      lineHeight: 1.1,
                    }}
                  >
                    {captain.name}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: ROLE_BG[captain.role] || '#374151',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    {captain.role?.toUpperCase()}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: GOLD_SOFT,
                      fontSize: 13,
                      fontFamily: "'Pinyon Script', cursive",
                      fontWeight: 400,
                      fontSizeAdjust: 0.5,
                    }}
                  >
                    Leading the charge
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============== SQUAD GRID ============== */}
          <div style={{ padding: '20px 70px 0 70px' }}>
            <GoldDivider label="THE SQUAD" />
            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 14,
              }}
            >
              {others.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${GOLD}33`,
                    borderRadius: 12,
                    padding: '10px 6px 12px 6px',
                  }}
                >
                  <PlayerAvatar player={p} size={cols === 4 ? 78 : 92} team={team} />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: cols === 4 ? 12 : 13,
                      fontWeight: 700,
                      color: '#fff',
                      textAlign: 'center',
                      lineHeight: 1.15,
                      width: '100%',
                      padding: '0 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: 0.3,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 9,
                      letterSpacing: 0.8,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: ROLE_BG[p.role] || '#374151',
                      color: '#fff',
                    }}
                  >
                    {p.role?.toUpperCase()}
                  </div>
                </div>
              ))}
              {others.length === 0 && (
                <div
                  style={{
                    gridColumn: `span ${cols}`,
                    textAlign: 'center',
                    color: GOLD_SOFT,
                    padding: 24,
                    fontStyle: 'italic',
                  }}
                >
                  Squad announcement coming soon.
                </div>
              )}
            </div>
          </div>

          {/* ============== FOOTER ============== */}
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              left: 0,
              right: 0,
              padding: '0 70px',
              textAlign: 'center',
            }}
          >
            <GoldDivider label="" accent={GOLD} />
            <div
              style={{
                marginTop: 14,
                fontFamily: "'Pinyon Script', cursive",
                fontSize: 44,
                color: GOLD_SOFT,
                lineHeight: 1,
              }}
            >
              Jo Karenge, Bada Karenge.
            </div>
            <div
              style={{
                marginTop: 8,
                color: '#fff',
                fontSize: 13,
                letterSpacing: 3,
                fontWeight: 600,
              }}
            >
              APL SEASON 01 &nbsp;•&nbsp; 16–17 MAY &nbsp;•&nbsp; A TO Z CRICKET GROUND, LAVALE
            </div>
          </div>
      </div>

      {/* Download button (rendered outside the captured area) */}
      <Space>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={handleDownload}
          size="large"
          style={{
            background: `linear-gradient(135deg, ${team.color}, ${team.color}cc)`,
            border: 'none',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Download {team.shortName} Card
        </Button>
      </Space>
    </div>
  );
}

// Avatar with crown badge for captain. Falls back to user icon if no photo.
function PlayerAvatar({ player, size, team, isCaptain }) {
  const ringW = isCaptain ? 4 : 3;
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        background: isCaptain
          ? `conic-gradient(${GOLD_SOFT}, ${GOLD}, ${GOLD_DEEP}, ${GOLD})`
          : team.color,
        padding: ringW,
        boxShadow: isCaptain
          ? '0 0 18px rgba(212,175,55,0.6)'
          : `0 0 10px ${team.color}55`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {player.photo ? (
          <img
            src={`${import.meta.env.BASE_URL}${player.photo.replace(/^\//, '')}`}
            alt={player.name}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <UserOutlined style={{ fontSize: size * 0.5, color: '#888' }} />
        )}
      </div>
      {isCaptain && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: -6,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_DEEP})`,
            color: '#1a1a2e',
            fontWeight: 900,
            fontFamily: "'Cinzel', serif",
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #1a1a2e',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          C
        </div>
      )}
    </div>
  );
}

export default function TeamInstaPostsPage() {
  const { teams, sponsors, teamStats, captainByTeamName } = useLeague();

  return (
    <div
      style={{
        // Page itself can scroll horizontally if the viewport is narrower
        // than the 1080px card. Cards always render at their native size.
        width: '100%',
        overflowX: 'auto',
        padding: '32px 24px 64px 24px',
      }}
    >
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Team Squad — Instagram Cards
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Cards render at full Instagram resolution (1080×1350). Click{' '}
          <b>Download</b> to save the PNG.
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 64,
          // Ensure the container is at least as wide as one card so flex
          // children don't get cramped on smaller viewports.
          minWidth: POST_W + 48,
          margin: '0 auto',
        }}
      >
        {teams.map((team) => {
          const sponsor = sponsors.find((s) => s.name === team.sponsor) || null;
          const roster = teamStats[team.name]?.roster || [];
          const captain = captainByTeamName[team.name] || null;
          return (
            <TeamPostCard
              key={team.id}
              team={team}
              sponsor={sponsor}
              captain={captain}
              roster={roster}
            />
          );
        })}
      </div>
    </div>
  );
}

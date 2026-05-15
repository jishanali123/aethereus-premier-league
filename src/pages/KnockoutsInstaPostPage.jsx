import { useRef, useState, useCallback } from 'react';
import { Typography, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';

const { Title, Text } = Typography;

// Same canvas dimensions as the league fixtures card so both posts feel like
// a matched set on the feed.
const POST_W = 1080;
const POST_H = 1620;

const GOLD = '#d4af37';
const GOLD_SOFT = '#f4d27a';
const GOLD_DEEP = '#a07c2c';
const NAVY_TOP = '#0a0a1f';
const NAVY_MID = '#1a0d2e';
const NAVY_BOT = '#080820';

// TBD slots referenced by league standing. Colors chosen to read like
// medal tiers (gold / silver / bronze / cool) so the four positions are
// instantly distinguishable even before teams are decided.
const SEMIS = [
  {
    key: 'sf1',
    title: 'SEMI-FINAL 1',
    time: '03:00 PM',
    home: { label: '1', name: '1st in League Table', color: '#e3b341' },
    away: { label: '4', name: '4th in League Table', color: '#7e57ff' },
  },
  {
    key: 'sf2',
    title: 'SEMI-FINAL 2',
    time: '04:30 PM',
    home: { label: '2', name: '2nd in League Table', color: '#c0c4cc' },
    away: { label: '3', name: '3rd in League Table', color: '#cd7f32' },
  },
];

const FINAL = {
  title: 'THE GRAND FINAL',
  time: '06:00 PM',
  home: { label: 'W1', name: 'Winner Semi-Final 1', color: GOLD_DEEP },
  away: { label: 'W2', name: 'Winner Semi-Final 2', color: GOLD_DEEP },
};

// Disc badge for a TBD slot — same visual grammar as the team badges on the
// league fixtures card, but the inner label is a position number / W1 / W2
// instead of a club abbreviation.
function SlotBadge({ slot, size = 64 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${slot.color}, ${slot.color}cc 70%, ${slot.color}88)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cinzel', serif",
        fontWeight: 800,
        fontSize: slot.label.length > 1 ? size * 0.32 : size * 0.42,
        letterSpacing: 1,
        border: `2px solid ${GOLD}`,
        boxShadow: `0 0 16px ${slot.color}66, inset 0 -4px 8px rgba(0,0,0,0.25)`,
        flexShrink: 0,
      }}
    >
      {slot.label}
    </div>
  );
}

// Single match row for a knockout fixture. `emphasis` makes the row taller
// and adds extra gold ornamentation — used for the Grand Final.
function KnockoutRow({ fixture, emphasis = false }) {
  const badgeSize = emphasis ? 78 : 60;
  const nameSize = emphasis ? 22 : 19;
  const minHeight = emphasis ? 100 : 78;
  const vsSize = emphasis ? 64 : 52;

  return (
    <div style={{ position: 'relative', marginTop: 28 }}>
      {/* Time + label chip (centered, floats above the row) */}
      <div
        style={{
          position: 'absolute',
          top: emphasis ? -22 : -18,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
          color: NAVY_TOP,
          fontFamily: "'Cinzel', serif",
          fontWeight: 800,
          fontSize: emphasis ? 18 : 16,
          letterSpacing: 1.4,
          padding: emphasis ? '6px 22px' : '4px 18px',
          borderRadius: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {fixture.title} &nbsp;•&nbsp; {fixture.time}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: emphasis
            ? `linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))`
            : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: `${emphasis ? 2 : 1.5}px solid ${GOLD}${emphasis ? 'cc' : '55'}`,
          borderRadius: 999,
          padding: emphasis ? '12px 22px' : '10px 18px',
          gap: 14,
          minHeight,
          boxShadow: emphasis ? `0 0 32px ${GOLD}44` : 'none',
        }}
      >
        <SlotBadge slot={fixture.home} size={badgeSize} />
        <div
          style={{
            flex: 1,
            textAlign: 'left',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: nameSize,
            color: '#fff',
            letterSpacing: 0.3,
            lineHeight: 1.15,
            paddingLeft: 6,
          }}
        >
          {fixture.home.name}
        </div>

        <div
          style={{
            width: vsSize,
            height: vsSize,
            borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            background: `radial-gradient(circle at 50% 40%, ${NAVY_MID}, ${NAVY_TOP})`,
            color: GOLD_SOFT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: emphasis ? 18 : 15,
            letterSpacing: 1,
            flexShrink: 0,
            boxShadow: `0 0 10px ${GOLD}66`,
          }}
        >
          VS
        </div>

        <div
          style={{
            flex: 1,
            textAlign: 'right',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: nameSize,
            color: '#fff',
            letterSpacing: 0.3,
            lineHeight: 1.15,
            paddingRight: 6,
          }}
        >
          {fixture.away.name}
        </div>
        <SlotBadge slot={fixture.away} size={badgeSize} />
      </div>
    </div>
  );
}

// Section pill — matches the DAY 1 / DAY 2 pill from the league fixtures card.
function SectionHeader({ label, accent = false }) {
  return (
    <div
      style={{
        margin: '0 auto',
        background: accent
          ? `linear-gradient(180deg, ${GOLD}33, ${GOLD}11)`
          : 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: `${accent ? 2 : 1.5}px solid ${GOLD}${accent ? 'cc' : '88'}`,
        borderRadius: 999,
        padding: accent ? '12px 36px' : '10px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        boxShadow: `0 0 22px ${GOLD}${accent ? '55' : '33'}`,
      }}
    >
      {accent && <span style={{ color: GOLD_SOFT, fontSize: 22 }}>✦</span>}
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 800,
          fontSize: accent ? 28 : 24,
          letterSpacing: 5,
          color: '#fff',
          textShadow: accent ? `0 0 14px ${GOLD}88` : 'none',
        }}
      >
        {label}
      </span>
      {accent && <span style={{ color: GOLD_SOFT, fontSize: 22 }}>✦</span>}
    </div>
  );
}

export default function KnockoutsInstaPostPage() {
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ref.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: POST_W,
        height: POST_H,
        backgroundColor: NAVY_TOP,
      });
      const link = document.createElement('a');
      link.download = 'apl-knockouts.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      message.error('Could not export image. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        padding: '32px 24px 64px 24px',
      }}
    >
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Knockouts — Instagram Card
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Card renders at {POST_W}×{POST_H} px. Click <b>Download</b> to save
          the PNG.
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          minWidth: POST_W + 48,
          margin: '0 auto',
        }}
      >
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Decorative gold sparkle glow + sweeping curves (matched to league card) */}
          <svg
            width={POST_W}
            height={POST_H}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="kn-sparkle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={GOLD_SOFT} stopOpacity="0.45" />
                <stop offset="100%" stopColor={GOLD_SOFT} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="260" r="220" fill="url(#kn-sparkle)" />
            <circle cx={POST_W - 80} cy="280" r="220" fill="url(#kn-sparkle)" />
            <circle cx="140" cy={POST_H - 260} r="240" fill="url(#kn-sparkle)" />
            <circle
              cx={POST_W - 140}
              cy={POST_H - 240}
              r="240"
              fill="url(#kn-sparkle)"
            />
            <path
              d={`M0 ${POST_H * 0.5} Q ${POST_W / 2} ${POST_H * 0.34}, ${POST_W} ${POST_H * 0.55}`}
              stroke={GOLD}
              strokeOpacity="0.16"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d={`M0 ${POST_H * 0.7} Q ${POST_W / 2} ${POST_H * 0.55}, ${POST_W} ${POST_H * 0.75}`}
              stroke={GOLD}
              strokeOpacity="0.12"
              strokeWidth="1.5"
              fill="none"
            />
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i * 97) % POST_W;
              const y = ((i * 53) % (POST_H - 100)) + 40;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i % 3 === 0 ? 1.4 : 0.8}
                  fill={GOLD_SOFT}
                  opacity={0.35}
                />
              );
            })}
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

          {/* ============== HEADER (logo · title · ASC) ============== */}
          <div
            style={{
              position: 'relative',
              padding: '44px 64px 0 64px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexShrink: 0,
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apl-logo.png`}
              alt="APL"
              crossOrigin="anonymous"
              style={{
                height: 130,
                width: 130,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 14px rgba(212,175,55,0.45))',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1, textAlign: 'center', marginTop: 0 }}>
              <div
                style={{
                  fontSize: 26,
                  lineHeight: 1,
                  color: GOLD_SOFT,
                  textShadow: `0 0 12px ${GOLD}, 0 0 4px ${GOLD}`,
                  marginBottom: 0,
                }}
              >
                ★
              </div>
              <div
                style={{
                  fontFamily:
                    "'Pirata One', 'MedievalSharp', 'Cinzel Decorative', serif",
                  fontWeight: 400,
                  fontSize: 110,
                  letterSpacing: 1,
                  background:
                    'linear-gradient(180deg, #fff4c2 0%, #f6d771 18%, #f1c34c 38%, #d4a52d 58%, #8b5a16 82%, #4a2f0a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter:
                    'drop-shadow(0 2px 0 #4a2f0a) drop-shadow(0 6px 12px rgba(0,0,0,0.6))',
                  lineHeight: 0.95,
                }}
              >
                aethereus
              </div>

              <div
                style={{
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: GOLD, fontSize: 11 }}>✦</span>
                <span
                  style={{
                    height: 1.5,
                    width: 70,
                    background: `linear-gradient(90deg, ${GOLD}22, ${GOLD})`,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: 24,
                    letterSpacing: 10,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  PREMIER LEAGUE
                </span>
                <span
                  style={{
                    height: 1.5,
                    width: 70,
                    background: `linear-gradient(270deg, ${GOLD}22, ${GOLD})`,
                    display: 'inline-block',
                  }}
                />
                <span style={{ color: GOLD, fontSize: 11 }}>✦</span>
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: 56,
                  background: `linear-gradient(180deg, #fff4c2, ${GOLD_SOFT}, ${GOLD})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))',
                }}
              >
                Knockout Stage
              </div>
            </div>

            {/* Organised by ASC badge */}
            <div
              style={{
                width: 130,
                height: 130,
                border: `2px solid ${GOLD}`,
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                background: 'rgba(255,255,255,0.04)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  letterSpacing: 1.8,
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
                  fontSize: 36,
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
                  fontSize: 8.5,
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

          {/* ============== META STRIP ============== */}
          <div
            style={{
              padding: '14px 64px 0 64px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: 999,
                border: `1.5px solid ${GOLD}88`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                color: '#fff',
                fontFamily: "'Cinzel', serif",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 2,
              }}
            >
              SEASON 01 &nbsp;•&nbsp; SUNDAY, 17 MAY &nbsp;•&nbsp; A TO Z CRICKET GROUND, LAVALE
            </div>
          </div>

          {/* ============== KNOCKOUT BRACKET ============== */}
          <div
            style={{
              position: 'relative',
              padding: '32px 64px 0 64px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Semi-finals */}
            <div>
              <SectionHeader label="SEMI-FINALS" />
              <div style={{ marginTop: 16 }}>
                {SEMIS.map((sf) => (
                  <KnockoutRow key={sf.key} fixture={sf} />
                ))}
              </div>
            </div>

            {/* Bracket connector — three short gold lines suggesting both
                semis funnel into the Final. Decorative only. */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                margin: '4px 0',
                color: GOLD,
              }}
            >
              <span
                style={{
                  height: 1,
                  width: 80,
                  background: `linear-gradient(90deg, transparent, ${GOLD})`,
                }}
              />
              <span style={{ fontSize: 22, lineHeight: 1 }}>♛</span>
              <span
                style={{
                  height: 1,
                  width: 80,
                  background: `linear-gradient(270deg, transparent, ${GOLD})`,
                }}
              />
            </div>

            {/* Grand Final */}
            <div>
              <SectionHeader label="GRAND FINAL" accent />
              <KnockoutRow fixture={FINAL} emphasis />
            </div>
          </div>

          {/* ============== FOOTER ============== */}
          <div
            style={{
              padding: '18px 70px 40px 70px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  height: 1,
                  flex: 1,
                  background: `linear-gradient(90deg, transparent, ${GOLD})`,
                }}
              />
              <span style={{ color: GOLD, fontSize: 14 }}>◆</span>
              <span
                style={{
                  height: 1,
                  flex: 1,
                  background: `linear-gradient(270deg, transparent, ${GOLD})`,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: "'Pinyon Script', cursive",
                fontSize: 48,
                color: GOLD_SOFT,
                lineHeight: 1,
              }}
            >
              Jo Karenge, Bada Karenge.
            </div>
          </div>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownload}
            size="large"
            style={{
              background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
              border: 'none',
              fontWeight: 700,
              letterSpacing: 0.5,
              color: NAVY_TOP,
            }}
          >
            Download Knockouts Card
          </Button>
        </Space>
      </div>
    </div>
  );
}

import { useRef, useState, useCallback, useMemo } from 'react';
import { Typography, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { toPng } from 'html-to-image';
import { useLeague } from '../context/LeagueContext';

const { Title, Text } = Typography;

// ---- Design tokens (shared with TeamInstaPostsPage / sponsor invitation) ----
const POST_W = 1080;
const POST_H = 1620; // 2:3 portrait — matches the fixtures reference layout

const GOLD = '#d4af37';
const GOLD_SOFT = '#f4d27a';
const GOLD_DEEP = '#a07c2c';
const NAVY_TOP = '#0a0a1f';
const NAVY_MID = '#1a0d2e';
const NAVY_BOT = '#080820';

// Per-team display label override for tight, recognizable badges on the card.
// Falls back to the team's `shortName` if not present here.
const BADGE_LABEL = {
  'global-hammerzz': 'GH',
  'salunkhe-strikers': 'PT',
  'vinayak-riders': 'VR',
  'durga-dhurandars': 'HD',
  'township-homes-warrior': 'TW',
  'sp-super-warriors': 'SS',
  'inter-warriors': 'IW',
  'first-qualifier': 'Q1',
};

// Friendlier short name used on the row label (kept simple — the design relies
// on the badge for the brand mark).
const ROW_NAME = {
  'durga-dhurandars': 'Hotel Durga Dhurandhars',
  'salunkhe-strikers': 'Dr Salunkhe Pathlab Titans',
};

// Virtual TBD slots that look like teams to the renderer. Used for knockout
// placeholders inside the league fixtures card (e.g. "First Qualifier").
const TBD_TEAMS = {
  'first-qualifier': {
    id: 'first-qualifier',
    name: 'First Qualifier',
    shortName: 'Q1',
    color: '#a07c2c',
  },
};

// Schedule mirrors the team match fixtures the user provided. Each entry is
// `{ time, homeId, awayId }` and references team `id`s from teams.json so the
// branding (color, name) stays in sync if a team is renamed.
const SCHEDULE = [
  {
    day: 1,
    label: 'DAY 1',
    date: 'Saturday, 16 May',
    matches: [
      { time: '09:00 AM', homeId: 'durga-dhurandars', awayId: 'inter-warriors' },
      { time: '10:30 AM', homeId: 'sp-super-warriors', awayId: 'global-hammerzz' },
      { time: '12:00 PM', homeId: 'vinayak-riders', awayId: 'township-homes-warrior' },
      { time: '01:00 PM', homeId: 'sp-super-warriors', awayId: 'inter-warriors' },
      { time: '05:30 PM', homeId: 'durga-dhurandars', awayId: 'sp-super-warriors' },
      { time: '07:00 PM', homeId: 'vinayak-riders', awayId: 'global-hammerzz' },
      { time: '08:30 PM', homeId: 'salunkhe-strikers', awayId: 'township-homes-warrior' },
      { time: '10:00 PM', homeId: 'salunkhe-strikers', awayId: 'inter-warriors' },
    ],
  },
  {
    day: 2,
    label: 'DAY 2',
    date: 'Sunday, 17 May',
    matches: [
      { time: '09:00 AM', homeId: 'durga-dhurandars', awayId: 'global-hammerzz' },
      { time: '10:30 AM', homeId: 'vinayak-riders', awayId: 'salunkhe-strikers' },
      { time: '12:00 PM', homeId: 'township-homes-warrior', awayId: 'first-qualifier' },
    ],
  },
];

// Circular team badge — colored disc with 2–3 letter abbreviation.
function TeamBadge({ team, size = 64 }) {
  const label = BADGE_LABEL[team.id] || team.shortName;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${team.color}, ${team.color}cc 70%, ${team.color}88)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cinzel', serif",
        fontWeight: 800,
        fontSize: size * 0.38,
        letterSpacing: 1,
        border: `2px solid ${GOLD}`,
        boxShadow: `0 0 16px ${team.color}66, inset 0 -4px 8px rgba(0,0,0,0.25)`,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

// Single match row: [Badge] Team A  —  ⏱ time / VS  —  Team B [Badge]
function MatchRow({ match, teamsById }) {
  const home = teamsById[match.homeId];
  const away = teamsById[match.awayId];
  if (!home || !away) return null;

  const homeName = ROW_NAME[home.id] || home.name;
  const awayName = ROW_NAME[away.id] || away.name;

  return (
    <div style={{ position: 'relative', marginTop: 18 }}>
      {/* Time chip (centered, floats above the row) */}
      <div
        style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
          color: NAVY_TOP,
          fontFamily: "'Cinzel', serif",
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: 1.2,
          padding: '4px 16px',
          borderRadius: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {match.time}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: `1.5px solid ${GOLD}55`,
          borderRadius: 999,
          padding: '8px 16px',
          gap: 12,
          minHeight: 72,
        }}
      >
        <TeamBadge team={home} size={58} />
        <div
          style={{
            flex: 1,
            textAlign: 'left',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 20,
            color: '#fff',
            letterSpacing: 0.3,
            lineHeight: 1.1,
            paddingLeft: 4,
          }}
        >
          {homeName}
        </div>

        {/* VS circle */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            background:
              `radial-gradient(circle at 50% 40%, ${NAVY_MID}, ${NAVY_TOP})`,
            color: GOLD_SOFT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 1,
            flexShrink: 0,
            boxShadow: `0 0 10px ${GOLD}44`,
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
            fontSize: 20,
            color: '#fff',
            letterSpacing: 0.3,
            lineHeight: 1.1,
            paddingRight: 4,
          }}
        >
          {awayName}
        </div>
        <TeamBadge team={away} size={58} />
      </div>
    </div>
  );
}

function DayHeader({ label, date }) {
  return (
    <div
      style={{
        margin: '0 auto',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: `1.5px solid ${GOLD}88`,
        borderRadius: 999,
        padding: '10px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        boxShadow: `0 0 18px ${GOLD}33`,
      }}
    >
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: 4,
          color: '#fff',
        }}
      >
        {label}
      </span>
      <span style={{ color: GOLD, fontSize: 14 }}>◆</span>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 600,
          fontSize: 20,
          color: GOLD_SOFT,
          letterSpacing: 1,
        }}
      >
        {date}
      </span>
    </div>
  );
}

export default function MatchFixturesInstaPostPage() {
  const { teams } = useLeague();
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const teamsById = useMemo(() => {
    const map = { ...TBD_TEAMS };
    for (const t of teams) map[t.id] = t;
    return map;
  }, [teams]);

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
      link.download = 'apl-match-fixtures.png';
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
          Match Fixtures — Instagram Card
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
          {/* Decorative gold sparkle glow + sweeping curves */}
          <svg
            width={POST_W}
            height={POST_H}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="fx-sparkle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={GOLD_SOFT} stopOpacity="0.45" />
                <stop offset="100%" stopColor={GOLD_SOFT} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="260" r="220" fill="url(#fx-sparkle)" />
            <circle cx={POST_W - 80} cy="280" r="220" fill="url(#fx-sparkle)" />
            <circle cx="140" cy={POST_H - 260} r="240" fill="url(#fx-sparkle)" />
            <circle
              cx={POST_W - 140}
              cy={POST_H - 240}
              r="240"
              fill="url(#fx-sparkle)"
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
            {/* Tiny stars scattered subtly */}
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
              {/* Small gold star ornament above the wordmark */}
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
              {/* Engraved-gold wordmark — thick ornate medieval lowercase */}
              <div
                style={{
                  fontFamily: "'Pirata One', 'MedievalSharp', 'Cinzel Decorative', serif",
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
                Match Fixtures
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
              SEASON 01 &nbsp;•&nbsp; 8-OVER MATCHES &nbsp;•&nbsp; A TO Z CRICKET GROUND, LAVALE
            </div>
          </div>

          {/* ============== DAYS / MATCHES ============== */}
          <div
            style={{
              position: 'relative',
              padding: '16px 64px 0 64px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
              minHeight: 0,
            }}
          >
            {SCHEDULE.map((day) => (
              <div key={day.day}>
                <DayHeader label={day.label} date={day.date} />
                <div style={{ marginTop: 10 }}>
                  {day.matches.map((m, idx) => (
                    <MatchRow
                      key={`${day.day}-${idx}`}
                      match={m}
                      teamsById={teamsById}
                    />
                  ))}
                </div>
              </div>
            ))}
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
            Download Fixtures Card
          </Button>
        </Space>
      </div>
    </div>
  );
}

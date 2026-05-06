import { useEffect, useState } from 'react';
import { Typography, Button, Tooltip, message } from 'antd';
import {
  DownloadOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
} from '@ant-design/icons';
import PlayerTable from '../components/PlayerTable';
import SuperStarsSection from '../components/SuperStarsSection';
import RatingSection from '../components/RatingSection';
import TeamPurseStrip from '../components/TeamPurseStrip';
import { useLeague } from '../context/LeagueContext';
import { AUCTION_LOCKED } from '../config';

const TOP_BATTERS_FILTER = (p) => (p.battingRating ?? 0) >= 4;
const TOP_BOWLERS_FILTER = (p) => (p.bowlingRating ?? 0) >= 4;

const { Title, Text } = Typography;

const LAST_EXPORT_KEY = 'apl-last-export-time';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTimestampForFilename(d = new Date()) {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}`
  );
}

function formatRelativeTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 30) return 'just now';
  if (diffSec < 90) return '1 min ago';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    const isToday = d.toDateString() === new Date().toDateString();
    if (isToday) {
      return `today at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return `${diffHr}h ago`;
  }
  return d.toLocaleString();
}

export default function PlayersPage() {
  const { players } = useLeague();
  const [lastExportIso, setLastExportIso] = useState(() => {
    try {
      return localStorage.getItem(LAST_EXPORT_KEY);
    } catch {
      return null;
    }
  });
  const [, setTick] = useState(0);
  const [teamFilter, setTeamFilter] = useState(null);

  // Re-render the relative time display every 30s so it stays fresh.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleExport = () => {
    try {
      const json = JSON.stringify(players, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `players_${formatTimestampForFilename()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const sold = players.filter((p) => p.sold).length;
      const nowIso = new Date().toISOString();
      try {
        localStorage.setItem(LAST_EXPORT_KEY, nowIso);
      } catch {
        /* localStorage unavailable; not critical */
      }
      setLastExportIso(nowIso);
      message.success(
        `Exported ${players.length} players (${sold} sold) to your Downloads.`,
      );
    } catch (err) {
      message.error('Export failed: ' + (err?.message || 'unknown error'));
    }
  };

  const lastExportLabel = formatRelativeTime(lastExportIso);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <Title level={1} style={{ marginBottom: 6, fontSize: 38 }}>
            Player Showcase
          </Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            Browse the league roster — click any player to view their full
            profile
          </Text>
        </div>

        {!AUCTION_LOCKED && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 6,
            }}
          >
            <Tooltip title="Download a JSON snapshot of every player's current sale status, team and price.">
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{ height: 48, fontWeight: 600 }}
              >
                Export Auction Results
              </Button>
            </Tooltip>
            <Text
              type="secondary"
              style={{ fontSize: 13 }}
              title={
                lastExportIso ? new Date(lastExportIso).toLocaleString() : ''
              }
            >
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              {lastExportLabel
                ? `Last exported ${lastExportLabel}`
                : 'No backup exported yet — hit Export to save a copy'}
            </Text>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <TeamPurseStrip
          selectedTeam={teamFilter}
          onTeamClick={setTeamFilter}
        />
      </div>
      <PlayerTable
        teamFilter={teamFilter}
        onClearTeamFilter={() => setTeamFilter(null)}
      />

      <SuperStarsSection />

      <RatingSection
        title="Top Batters"
        icon={
          <ThunderboltOutlined style={{ fontSize: 26, color: '#1677ff' }} />
        }
        accent="#1677ff"
        subtitle="Batting rating 4 or 5"
        primaryStat="battingRating"
        filter={TOP_BATTERS_FILTER}
        storageKey="top-batters"
        defaultCollapsed
      />

      <RatingSection
        title="Top Bowlers"
        icon={<FireOutlined style={{ fontSize: 26, color: '#ff4d4f' }} />}
        accent="#ff4d4f"
        subtitle="Bowling rating 4 or 5"
        primaryStat="bowlingRating"
        filter={TOP_BOWLERS_FILTER}
        storageKey="top-bowlers"
        defaultCollapsed
      />
    </div>
  );
}

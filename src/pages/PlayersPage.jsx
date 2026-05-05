import { useEffect, useRef, useState } from 'react';
import { Typography, Button, Tooltip, message, Space, Modal } from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import PlayerTable from '../components/PlayerTable';
import SuperStarsSection from '../components/SuperStarsSection';
import TeamPurseStrip from '../components/TeamPurseStrip';
import { useLeague } from '../context/LeagueContext';

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
  const { players, replaceAllPlayers } = useLeague();
  const fileInputRef = useRef(null);
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

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChosen = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => message.error('Could not read the file.');
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch (err) {
        message.error('Invalid JSON file: ' + (err?.message || 'parse error'));
        return;
      }

      // Confirm before overwriting current state.
      const incomingCount = Array.isArray(parsed) ? parsed.length : 0;
      const incomingSold = Array.isArray(parsed)
        ? parsed.filter((p) => p && p.sold).length
        : 0;
      const currentSold = players.filter((p) => p.sold).length;

      Modal.confirm({
        title: 'Replace current player data?',
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>
              <strong>{file.name}</strong>
            </p>
            <p style={{ marginBottom: 4 }}>
              Incoming: {incomingCount} players ({incomingSold} sold)
            </p>
            <p style={{ marginBottom: 4 }}>
              Current: {players.length} players ({currentSold} sold)
            </p>
            <p style={{ marginTop: 12, color: '#cf1322' }}>
              This will replace ALL player data on this device. The repository
              files are unchanged.
            </p>
          </div>
        ),
        okText: 'Replace data',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        onOk: () => {
          try {
            replaceAllPlayers(parsed);
            message.success(`Loaded ${incomingCount} players from ${file.name}`);
          } catch (err) {
            message.error(
              'Import failed: ' + (err?.message || 'invalid data shape'),
            );
          }
        },
      });
    };
    reader.readAsText(file);
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <Space wrap>
            <Tooltip title="Pick a previously-exported JSON file to restore the auction state on this device.">
              <Button
                size="large"
                icon={<UploadOutlined />}
                onClick={handleImportClick}
                style={{ height: 48, fontWeight: 500 }}
              >
                Import Results
              </Button>
            </Tooltip>
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
          </Space>
          <Text
            type="secondary"
            style={{ fontSize: 13 }}
            title={lastExportIso ? new Date(lastExportIso).toLocaleString() : ''}
          >
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            {lastExportLabel
              ? `Last exported ${lastExportLabel}`
              : 'No backup exported yet — hit Export to save a copy'}
          </Text>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChosen}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 20,
          background: '#f5f5f5',
          paddingTop: 12,
          paddingBottom: 16,
          marginBottom: 16,
          marginLeft: -32,
          marginRight: -32,
          paddingLeft: 32,
          paddingRight: 32,
          borderBottom: '1px solid #e8e8e8',
          boxShadow: '0 4px 12px -8px rgba(0,0,0,0.15)',
        }}
      >
        <TeamPurseStrip
          selectedTeam={teamFilter}
          onTeamClick={setTeamFilter}
        />
      </div>
      <SuperStarsSection />
      <PlayerTable
        teamFilter={teamFilter}
        onClearTeamFilter={() => setTeamFilter(null)}
      />
    </div>
  );
}

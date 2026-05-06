import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Input,
  Select,
  Tag,
  Avatar,
  Badge,
  Rate,
  Segmented,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';

const { Search } = Input;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

export default function PlayerTable({ teamFilter = null, onClearTeamFilter }) {
  const { players, teams, captainPlayerIds } = useLeague();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'available' | 'sold'

  const roles = [...new Set(players.map((p) => p.role))];

  const teamColorByName = useMemo(() => {
    const m = {};
    for (const t of teams) m[t.name] = t.color;
    return m;
  }, [teams]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.role.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = !roleFilter || p.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && !p.sold) ||
        (statusFilter === 'sold' && p.sold);
      const matchesTeam = !teamFilter || p.team === teamFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesTeam;
    });
  }, [players, searchText, roleFilter, statusFilter, teamFilter]);

  const availableCount = players.filter((p) => !p.sold).length;
  const soldCount = players.length - availableCount;

  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={record.photo}
              icon={<UserOutlined />}
              size={64}
            />
            {captainPlayerIds.has(record.id) && (
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#faad14',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1,
                  border: '2px solid #fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
                title="Captain"
                aria-label="Team captain"
              >
                C
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{name}</div>
            <div className="mobile-player-sub" style={{ display: 'none', marginTop: 4, fontSize: 14, color: '#8c8c8c' }}>
              <Tag
                color={ROLE_COLORS[record.role] || 'default'}
                style={{ fontSize: 13, padding: '2px 8px', borderRadius: 8, marginRight: 6 }}
              >
                {record.role}
              </Tag>
              {'⭐'.repeat(record.battingRating ?? 0)} Bat
              {' · '}
              {'⭐'.repeat(record.bowlingRating ?? 0)} Bowl
              {' · '}
              {'⭐'.repeat(record.fieldingRating ?? 0)} Field
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => (
        <Tag
          color={ROLE_COLORS[role] || 'default'}
          style={{ fontSize: 14, padding: '4px 12px', borderRadius: 10 }}
        >
          {role}
        </Tag>
      ),
      responsive: ['sm'],
    },
    {
      title: 'Batting',
      dataIndex: 'battingRating',
      key: 'battingRating',
      sorter: (a, b) => (a.battingRating ?? 0) - (b.battingRating ?? 0),
      render: (val) => (
        <Rate disabled value={val ?? 0} count={5} style={{ fontSize: 22 }} />
      ),
      responsive: ['md'],
    },
    {
      title: 'Bowling',
      dataIndex: 'bowlingRating',
      key: 'bowlingRating',
      sorter: (a, b) => (a.bowlingRating ?? 0) - (b.bowlingRating ?? 0),
      render: (val) => (
        <Rate disabled value={val ?? 0} count={5} style={{ fontSize: 22 }} />
      ),
      responsive: ['md'],
    },
    {
      title: 'Fielding',
      dataIndex: 'fieldingRating',
      key: 'fieldingRating',
      sorter: (a, b) => (a.fieldingRating ?? 0) - (b.fieldingRating ?? 0),
      render: (val) => (
        <Rate disabled value={val ?? 0} count={5} style={{ fontSize: 22 }} />
      ),
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'sold',
      key: 'sold',
      sorter: (a, b) => {
        const aTeam = a.team || '';
        const bTeam = b.team || '';
        if (aTeam !== bTeam) return aTeam.localeCompare(bTeam);
        return (b.price ?? 0) - (a.price ?? 0);
      },
      render: (_, record) => {
        if (!record.sold) {
          return (
            <Badge
              status="warning"
              text={
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  Available
                </span>
              }
            />
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {record.team ? (
              <Tag
                color={teamColorByName[record.team] || 'green'}
                style={{
                  fontSize: 13,
                  padding: '2px 10px',
                  borderRadius: 10,
                  fontWeight: 600,
                  margin: 0,
                  width: 'fit-content',
                }}
              >
                {record.team}
              </Tag>
            ) : (
              <Badge status="success" text="Sold" />
            )}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#52c41a',
              }}
            >
              {formatPrice(record.price)}
            </span>
          </div>
        );
      },
      responsive: ['sm'],
    },
  ];

  return (
    <div className="player-table-projector">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          alignItems: 'center',
        }}
      >
        <Search
          placeholder="Search players, teams, roles..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: '1 1 320px', maxWidth: 420, fontSize: 16 }}
          size="large"
        />
        <Select
          placeholder="All Roles"
          allowClear
          onChange={(val) => setRoleFilter(val)}
          style={{ flex: '0 1 200px' }}
          size="large"
          options={roles.map((r) => ({ value: r, label: r }))}
        />
        <Segmented
          size="large"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: `All (${players.length})` },
            { value: 'available', label: `Available (${availableCount})` },
            { value: 'sold', label: `Sold (${soldCount})` },
          ]}
        />
        {teamFilter && (
          <Tag
            color={teamColorByName[teamFilter] || 'blue'}
            closable
            closeIcon={<CloseOutlined />}
            onClose={(e) => {
              e.preventDefault();
              onClearTeamFilter?.();
            }}
            style={{
              fontSize: 14,
              padding: '6px 12px',
              borderRadius: 10,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Team: {teamFilter}
          </Tag>
        )}
        <div style={{ flex: 1, minWidth: 0 }} />
        <div
          style={{
            color: '#8c8c8c',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {filteredPlayers.length} shown
        </div>
      </div>

      <Table
        dataSource={filteredPlayers}
        columns={columns}
        rowKey="id"
        size="large"
        pagination={{
          pageSize: 15,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/players/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <div style={{ padding: 32 }}>
              <TrophyOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <p style={{ color: '#8c8c8c', marginTop: 12 }}>
                No players found matching your criteria
              </p>
            </div>
          ),
        }}
        style={{ borderRadius: 12, overflow: 'hidden', fontSize: 16 }}
      />
    </div>
  );
}

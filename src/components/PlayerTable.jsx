import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Tag, Avatar, Space, Badge } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { usePlayers, getTeams, getRoles, formatPrice } from '../hooks/usePlayers';

const { Search } = Input;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

const TEAM_COLORS = {
  'Royal Strikers': '#1677ff',
  'Thunder Kings': '#faad14',
  'Blaze Warriors': '#ff4d4f',
  'Supreme Challengers': '#722ed1',
};

export default function PlayerTable() {
  const { players, loading, error } = usePlayers();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);

  const teams = getTeams();
  const roles = getRoles();

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (p.team ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        p.role.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = !roleFilter || p.role === roleFilter;
      const matchesTeam = !teamFilter || p.team === teamFilter;
      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [players, searchText, roleFilter, teamFilter]);

  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <Avatar
            src={record.photo}
            icon={<UserOutlined />}
            size={40}
            style={{ flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.matches} matches
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => (
        <Tag color={ROLE_COLORS[role] || 'default'}>{role}</Tag>
      ),
      responsive: ['sm'],
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      sorter: (a, b) => (a.team ?? '').localeCompare(b.team ?? ''),
      render: (team) =>
        team ? (
          <Tag
            color={TEAM_COLORS[team]}
            style={{ borderRadius: 12, fontWeight: 500 }}
          >
            {team}
          </Tag>
        ) : (
          <Tag style={{ borderRadius: 12 }}>Unassigned</Tag>
        ),
      responsive: ['md'],
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price, record) => (
        <span style={{ fontWeight: 600, color: record.sold ? '#52c41a' : '#faad14' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Runs',
      dataIndex: 'runs',
      key: 'runs',
      sorter: (a, b) => a.runs - b.runs,
      align: 'right',
      responsive: ['lg'],
    },
    {
      title: 'Wickets',
      dataIndex: 'wickets',
      key: 'wickets',
      sorter: (a, b) => a.wickets - b.wickets,
      align: 'right',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'sold',
      key: 'sold',
      render: (sold) => (
        <Badge
          status={sold ? 'success' : 'warning'}
          text={sold ? 'Sold' : 'Available'}
        />
      ),
      responsive: ['sm'],
    },
  ];

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#ff4d4f' }}>
        Error loading players: {error}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Search
          placeholder="Search players, teams, roles..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: '1 1 240px', maxWidth: 360 }}
          size="large"
        />
        <Select
          placeholder="All Roles"
          allowClear
          onChange={(val) => setRoleFilter(val)}
          style={{ flex: '0 1 180px' }}
          size="large"
          options={roles.map((r) => ({ value: r, label: r }))}
        />
        <Select
          placeholder="All Teams"
          allowClear
          onChange={(val) => setTeamFilter(val)}
          style={{ flex: '0 1 200px' }}
          size="large"
          options={teams.map((t) => ({ value: t, label: t }))}
        />
      </div>

      <Table
        dataSource={filteredPlayers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
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
        style={{ borderRadius: 12, overflow: 'hidden' }}
      />
    </div>
  );
}

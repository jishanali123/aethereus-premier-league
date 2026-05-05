import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Tag, Avatar, Space, Badge, Rate } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useLeague } from '../context/LeagueContext';

const { Search } = Input;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

export default function PlayerTable() {
  const { players } = useLeague();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);

  const roles = [...new Set(players.map((p) => p.role))];

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.role.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = !roleFilter || p.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [players, searchText, roleFilter]);

  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar
            src={record.photo}
            icon={<UserOutlined />}
            size={64}
            style={{ flexShrink: 0 }}
          />
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
      render: (sold) => (
        <Badge
          status={sold ? 'success' : 'warning'}
          text={
            <span style={{ fontSize: 15, fontWeight: 500 }}>
              {sold ? 'Sold' : 'Available'}
            </span>
          }
        />
      ),
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
        }}
      >
        <Search
          placeholder="Search players, teams, roles..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: '1 1 320px', maxWidth: 480, fontSize: 16 }}
          size="large"
        />
        <Select
          placeholder="All Roles"
          allowClear
          onChange={(val) => setRoleFilter(val)}
          style={{ flex: '0 1 220px' }}
          size="large"
          options={roles.map((r) => ({ value: r, label: r }))}
        />
        <div style={{ flex: 1, minWidth: 0 }} />
        <div
          style={{
            alignSelf: 'center',
            color: '#8c8c8c',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {filteredPlayers.length} players
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

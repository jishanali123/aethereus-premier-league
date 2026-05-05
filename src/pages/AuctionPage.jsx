import { useState, useMemo } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Select,
  Avatar,
  Tag,
  Badge,
  InputNumber,
  Popconfirm,
  Alert,
  Space,
  Progress,
  Empty,
  Modal,
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  SwapRightOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';

const { Title, Text } = Typography;

const ROLE_COLORS = {
  Batsman: 'blue',
  Bowler: 'red',
  'All-Rounder': 'purple',
  'Wicket-Keeper': 'green',
};

export default function AuctionPage() {
  const { players, teams, teamStats, updatePlayer, resetAuction } =
    useLeague();

  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidTeam, setBidTeam] = useState(null);
  const [bidStep, setBidStep] = useState(50);

  const unsoldPlayers = useMemo(
    () => players.filter((p) => !p.sold),
    [players],
  );
  const soldPlayers = useMemo(
    () => players.filter((p) => p.sold),
    [players],
  );

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === currentPlayerId) ?? null,
    [players, currentPlayerId],
  );

  const pickPlayer = (player) => {
    setCurrentPlayerId(player.id);
    setBidAmount(player.basePrice);
    setBidTeam(null);
  };

  const pickNext = () => {
    const next = unsoldPlayers.find((p) => p.id !== currentPlayerId);
    if (next) pickPlayer(next);
    else setCurrentPlayerId(null);
  };

  const handleSold = () => {
    if (!currentPlayer || !bidTeam) return;
    updatePlayer(currentPlayer.id, {
      sold: true,
      price: bidAmount,
      team: bidTeam,
    });
    pickNext();
  };

  const handleUnsold = () => {
    if (!currentPlayer) return;
    updatePlayer(currentPlayer.id, {
      sold: false,
      price: 0,
      team: null,
    });
    pickNext();
  };

  const handleSkip = () => {
    if (!currentPlayer) return;
    const remaining = unsoldPlayers.filter(
      (p) => p.id !== currentPlayer.id,
    );
    if (remaining.length > 0) pickPlayer(remaining[0]);
  };

  const teamOptions = teams.map((t) => {
    const stats = teamStats[t.name];
    return {
      value: t.name,
      label: `${t.name} (${formatPrice(stats?.remaining ?? t.totalPurse)} left)`,
      disabled: stats && stats.remaining < bidAmount,
    };
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            <ThunderboltOutlined
              style={{ marginRight: 8, color: '#faad14' }}
            />
            Auction Room
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            {soldPlayers.length} sold • {unsoldPlayers.length} remaining
          </Text>
        </div>
        <Popconfirm
          title="Reset entire auction?"
          description="All players will be marked unsold and unassigned."
          onConfirm={resetAuction}
        >
          <Button icon={<UndoOutlined />} danger>
            Reset Auction
          </Button>
        </Popconfirm>
      </div>

      {/* Team Purse Overview */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {teams.map((t) => {
          const stats = teamStats[t.name];
          const pct = stats
            ? Math.round((stats.spent / t.totalPurse) * 100)
            : 0;
          return (
            <Col xs={12} sm={6} key={t.id}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  borderTop: `3px solid ${t.color}`,
                }}
              >
                <Text strong style={{ color: t.color, fontSize: 13 }}>
                  {t.name}
                </Text>
                <div style={{ fontSize: 12, color: '#8c8c8c', margin: '4px 0' }}>
                  {stats?.count ?? 0} players • Spent{' '}
                  {formatPrice(stats?.spent ?? 0)}
                </div>
                <Progress
                  percent={pct}
                  size="small"
                  strokeColor={t.color}
                  format={() => formatPrice(stats?.remaining ?? t.totalPurse)}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Current Player Bidding Panel */}
        <Col xs={24} lg={14}>
          {currentPlayer ? (
            <Card
              style={{
                borderRadius: 16,
                border: '2px solid #1677ff',
                boxShadow: '0 4px 24px rgba(22,119,255,0.12)',
              }}
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#faad14' }} />
                  <span>Now Bidding</span>
                </Space>
              }
            >
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                }}
              >
                <Avatar
                  src={currentPlayer.photo}
                  icon={<UserOutlined />}
                  size={100}
                  style={{
                    border: '3px solid #f0f0f0',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Title level={3} style={{ margin: '0 0 4px' }}>
                    {currentPlayer.name}
                  </Title>
                  <Space wrap>
                    <Tag
                      color={ROLE_COLORS[currentPlayer.role]}
                      style={{ borderRadius: 12 }}
                    >
                      {currentPlayer.role}
                    </Tag>
                    <Text type="secondary">
                      {currentPlayer.matches} matches •{' '}
                      {currentPlayer.runs} runs •{' '}
                      {currentPlayer.wickets} wkts
                    </Text>
                  </Space>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">Base Price: </Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {formatPrice(currentPlayer.basePrice)}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Bid Controls */}
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  background: '#fafafa',
                  marginBottom: 16,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    BID INCREMENT
                  </Text>
                  <div>
                    <Select
                      value={bidStep}
                      onChange={setBidStep}
                      style={{ width: 160 }}
                      options={[
                        { value: 25, label: '₹25' },
                        { value: 50, label: '₹50' },
                        { value: 100, label: '₹100' },
                        { value: 250, label: '₹250' },
                        { value: 500, label: '₹500' },
                      ]}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    size="large"
                    onClick={() =>
                      setBidAmount((prev) =>
                        Math.max(currentPlayer.basePrice, prev - bidStep),
                      )
                    }
                  >
                    − {formatPrice(bidStep)}
                  </Button>
                  <div
                    style={{
                      textAlign: 'center',
                      flex: '1 1 120px',
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: 'block' }}
                    >
                      CURRENT BID
                    </Text>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        color: '#1677ff',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatPrice(bidAmount)}
                    </Title>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setBidAmount((prev) => prev + bidStep)}
                  >
                    + {formatPrice(bidStep)}
                  </Button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Or set manually:{' '}
                  </Text>
                  <InputNumber
                    value={bidAmount}
                    onChange={(v) => v != null && setBidAmount(v)}
                    min={currentPlayer.basePrice}
                    step={bidStep}
                    formatter={(v) =>
                      `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(v) => v.replace(/₹\s?|(,*)/g, '')}
                    style={{ width: 200 }}
                  />
                </div>
              </Card>

              {/* Team Selection */}
              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: 'block', marginBottom: 4 }}
                >
                  ASSIGN TO TEAM
                </Text>
                <Select
                  value={bidTeam}
                  onChange={setBidTeam}
                  placeholder="Select winning team"
                  style={{ width: '100%' }}
                  size="large"
                  options={teamOptions}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleSold}
                  disabled={!bidTeam}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    height: 48,
                    fontWeight: 600,
                    background: bidTeam ? '#52c41a' : undefined,
                    borderColor: bidTeam ? '#52c41a' : undefined,
                  }}
                >
                  SOLD — {formatPrice(bidAmount)}
                </Button>
                <Button
                  size="large"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleUnsold}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  UNSOLD
                </Button>
                <Button
                  size="large"
                  icon={<SwapRightOutlined />}
                  onClick={handleSkip}
                  disabled={unsoldPlayers.length <= 1}
                  style={{ height: 48 }}
                >
                  Skip
                </Button>
              </div>
            </Card>
          ) : (
            <Card
              style={{
                borderRadius: 16,
                textAlign: 'center',
                padding: '48px 24px',
              }}
            >
              {unsoldPlayers.length > 0 ? (
                <>
                  <ThunderboltOutlined
                    style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }}
                  />
                  <Title level={4}>Select a Player to Start Bidding</Title>
                  <Text type="secondary">
                    Pick a player from the queue on the right
                  </Text>
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => pickPlayer(unsoldPlayers[0])}
                    >
                      Start with First Player
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircleOutlined
                    style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}
                  />
                  <Title level={4} style={{ color: '#52c41a' }}>
                    Auction Complete!
                  </Title>
                  <Text type="secondary">
                    All {players.length} players have been auctioned
                  </Text>
                </>
              )}
            </Card>
          )}
        </Col>

        {/* Player Queue & Sold List */}
        <Col xs={24} lg={10}>
          {/* Unsold Queue */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>
                  Player Queue ({unsoldPlayers.length})
                </span>
              </Space>
            }
            style={{ borderRadius: 16, marginBottom: 16 }}
            styles={{
              body: {
                maxHeight: 320,
                overflowY: 'auto',
                padding: unsoldPlayers.length ? '12px' : undefined,
              },
            }}
          >
            {unsoldPlayers.length === 0 ? (
              <Empty description="All players auctioned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              unsoldPlayers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => pickPlayer(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    marginBottom: 4,
                    background:
                      p.id === currentPlayerId
                        ? '#e6f4ff'
                        : 'transparent',
                    border:
                      p.id === currentPlayerId
                        ? '1px solid #91caff'
                        : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Avatar
                    src={p.photo}
                    icon={<UserOutlined />}
                    size={36}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {p.role} • Base {formatPrice(p.basePrice)}
                    </Text>
                  </div>
                  <Tag
                    color={ROLE_COLORS[p.role]}
                    style={{ borderRadius: 10, fontSize: 11 }}
                  >
                    {p.role}
                  </Tag>
                </div>
              ))
            )}
          </Card>

          {/* Sold Players */}
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Sold ({soldPlayers.length})</span>
              </Space>
            }
            style={{ borderRadius: 16 }}
            styles={{
              body: {
                maxHeight: 280,
                overflowY: 'auto',
                padding: soldPlayers.length ? '12px' : undefined,
              },
            }}
          >
            {soldPlayers.length === 0 ? (
              <Empty
                description="No players sold yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              soldPlayers.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    marginBottom: 4,
                    background: '#f6ffed',
                    border: '1px solid #d9f7be',
                  }}
                >
                  <Avatar
                    src={p.photo}
                    icon={<UserOutlined />}
                    size={32}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {p.team}
                    </Text>
                  </div>
                  <Text
                    strong
                    style={{ color: '#52c41a', fontSize: 13 }}
                  >
                    {formatPrice(p.price)}
                  </Text>
                </div>
              ))
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

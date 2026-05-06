import { useState, useMemo, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Tag,
  Badge,
  Button,
  Select,
  InputNumber,
  Alert,
  Space,
  Divider,
  Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useLeague, formatPrice } from '../context/LeagueContext';
import { AUCTION_LOCKED } from '../config';

const { Text } = Typography;

const TEAM_COLORS = {
  'Royal Strikers': '#1677ff',
  'Thunder Kings': '#faad14',
  'Blaze Warriors': '#ff4d4f',
  'Supreme Challengers': '#722ed1',
};

export default function SalePanel({ player }) {
  const { teams, teamStats, updatePlayer } = useLeague();
  const [editing, setEditing] = useState(false);
  const [team, setTeam] = useState(null);
  const [price, setPrice] = useState(player?.basePrice ?? 0);

  // Initialise / reset form whenever the active player changes or
  // the operator toggles edit mode.
  useEffect(() => {
    if (!player) return;
    setTeam(player.sold ? player.team : null);
    setPrice(player.sold ? player.price : player.basePrice);
  }, [player, editing]);

  // When the auction is locked the form is never shown.
  // Otherwise show the form for unsold players, or when the operator has
  // explicitly clicked "Edit Sale" on a sold player.
  const showForm = !AUCTION_LOCKED && (!player.sold || editing);

  const teamOptions = useMemo(() => {
    return teams.map((t) => {
      const stats = teamStats[t.name];
      // When editing the SAME team the player already belongs to, treat the
      // existing sale price as already refunded (so the new bid is compared
      // against the team's purse + current price).
      const sameTeam = player.sold && player.team === t.name;
      const effectiveRemaining =
        (stats?.remaining ?? t.totalPurse) + (sameTeam ? player.price : 0);
      const cantAfford = price > effectiveRemaining;
      return {
        value: t.name,
        label: `${t.name} — ${formatPrice(effectiveRemaining)} left`,
        disabled: cantAfford,
        color: t.color,
      };
    });
  }, [teams, teamStats, player, price]);

  const selectedTeamStats = team ? teamStats[team] : null;
  const sameTeamAsCurrent = player.sold && team === player.team;
  const effectiveRemainingForSelected = team
    ? (selectedTeamStats?.remaining ?? 0) +
      (sameTeamAsCurrent ? player.price : 0)
    : null;
  const cannotAfford =
    team && effectiveRemainingForSelected != null
      ? price > effectiveRemainingForSelected
      : false;

  const handleSold = () => {
    if (!team || cannotAfford) return;
    updatePlayer(player.id, { sold: true, price, team });
    setEditing(false);
  };

  const handleUnsold = () => {
    updatePlayer(player.id, { sold: false, price: 0, team: null });
    setEditing(false);
  };

  // ---- Locked + unsold: read-only summary, no sale data to show ----
  if (AUCTION_LOCKED && !player.sold) {
    return (
      <>
        <Row gutter={[32, 28]}>
          <Col xs={12} sm={8}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              STATUS
            </Text>
            <Badge
              status="default"
              text={
                <Text strong style={{ color: '#8c8c8c', fontSize: 18 }}>
                  Unsold
                </Text>
              }
            />
          </Col>
          <Col xs={12} sm={8}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              BASE PRICE
            </Text>
            <Text style={{ fontSize: 22 }}>
              {formatPrice(player.basePrice)}
            </Text>
          </Col>
        </Row>
        <Divider style={{ margin: '24px 0 12px' }} />
        <Text type="secondary" style={{ fontSize: 14 }}>
          <LockOutlined style={{ marginRight: 6 }} />
          Auction closed — sale details are locked.
        </Text>
      </>
    );
  }

  // ---- Sold display (when not editing) ----
  if (!showForm) {
    return (
      <>
        <Row gutter={[32, 28]}>
          <Col xs={12} sm={6}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              STATUS
            </Text>
            <Badge
              status="success"
              text={
                <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                  Sold
                </Text>
              }
            />
          </Col>
          <Col xs={12} sm={6}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              SOLD PRICE
            </Text>
            <Text strong style={{ fontSize: 28, color: '#52c41a' }}>
              {formatPrice(player.price)}
            </Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              BASE PRICE
            </Text>
            <Text style={{ fontSize: 22 }}>
              {formatPrice(player.basePrice)}
            </Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                display: 'block',
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              TEAM
            </Text>
            {player.team ? (
              <Tag
                color={TEAM_COLORS[player.team]}
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '4px 14px',
                  borderRadius: 12,
                }}
              >
                {player.team}
              </Tag>
            ) : (
              <Text type="secondary">Unassigned</Text>
            )}
          </Col>
        </Row>
        {AUCTION_LOCKED ? (
          <>
            <Divider style={{ margin: '24px 0 12px' }} />
            <Text type="secondary" style={{ fontSize: 14 }}>
              <LockOutlined style={{ marginRight: 6 }} />
              Auction closed — sale details are locked.
            </Text>
          </>
        ) : (
          <>
            <Divider style={{ margin: '24px 0 16px' }} />
            <Space wrap>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
                size="large"
              >
                Edit Sale
              </Button>
              <Popconfirm
                title="Mark this player as unsold?"
                description="The player will go back into the available pool."
                okText="Yes, mark unsold"
                cancelText="Cancel"
                onConfirm={handleUnsold}
              >
                <Button danger icon={<CloseCircleOutlined />} size="large">
                  Mark Unsold
                </Button>
              </Popconfirm>
            </Space>
          </>
        )}
      </>
    );
  }

  // ---- Sale form (available player OR editing a sold one) ----
  return (
    <>
      {!player.sold && (
        <div style={{ marginBottom: 20 }}>
          <Badge
            status="warning"
            text={
              <Text strong style={{ fontSize: 20 }}>
                Available for Auction
              </Text>
            }
          />
          <Text type="secondary" style={{ marginLeft: 12, fontSize: 16 }}>
            Base Price:{' '}
            <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
              {formatPrice(player.basePrice)}
            </Text>
          </Text>
        </div>
      )}

      {player.sold && editing && (
        <Alert
          type="info"
          showIcon
          message="Editing existing sale"
          description="Update the team or price below and click Save Sale. Mark Unsold to return the player to the pool."
          style={{ marginBottom: 20 }}
        />
      )}

      <Row gutter={[24, 20]} align="middle">
        <Col xs={24} md={12}>
          <Text
            type="secondary"
            style={{
              fontSize: 14,
              display: 'block',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            WINNING TEAM
          </Text>
          <Select
            value={team}
            onChange={setTeam}
            placeholder="Select team"
            size="large"
            style={{ width: '100%' }}
            options={teamOptions}
          />
        </Col>
        <Col xs={24} md={12}>
          <Text
            type="secondary"
            style={{
              fontSize: 14,
              display: 'block',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            SOLD PRICE (₹)
          </Text>
          <InputNumber
            value={price}
            onChange={(v) => v != null && setPrice(v)}
            min={player.basePrice}
            step={50}
            size="large"
            style={{ width: '100%', fontSize: 18 }}
            formatter={(v) =>
              `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(v) => v.replace(/₹\s?|(,*)/g, '')}
          />
        </Col>
      </Row>

      {cannotAfford && team && (
        <Alert
          type="error"
          showIcon
          message={`${team} cannot afford this price`}
          description={`Available purse: ${formatPrice(effectiveRemainingForSelected)}. Lower the price or pick a different team.`}
          style={{ marginTop: 16 }}
        />
      )}

      <Divider style={{ margin: '24px 0 16px' }} />

      <Space wrap>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleSold}
          disabled={!team || cannotAfford}
          style={{
            background: !team || cannotAfford ? undefined : '#52c41a',
            borderColor: !team || cannotAfford ? undefined : '#52c41a',
            fontWeight: 600,
            height: 48,
            minWidth: 200,
          }}
        >
          {player.sold ? 'Save Sale' : 'Mark as Sold'} — {formatPrice(price)}
        </Button>

        {player.sold && (
          <>
            <Button size="large" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Popconfirm
              title="Mark this player as unsold?"
              description="The player will go back into the available pool."
              okText="Yes, mark unsold"
              cancelText="Cancel"
              onConfirm={handleUnsold}
            >
              <Button danger icon={<CloseCircleOutlined />} size="large">
                Mark Unsold
              </Button>
            </Popconfirm>
          </>
        )}

        {!player.sold && (
          <Text type="secondary" style={{ marginLeft: 8 }}>
            <DollarOutlined style={{ marginRight: 4 }} />
            Pick a team above to enable the SOLD button
          </Text>
        )}
      </Space>
    </>
  );
}

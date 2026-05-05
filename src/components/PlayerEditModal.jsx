import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { useLeague } from '../context/LeagueContext';

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

export default function PlayerEditModal({ player, open, onClose }) {
  const { teams, updatePlayer, addPlayer } = useLeague();
  const [form] = Form.useForm();
  const isNew = !player;

  useEffect(() => {
    if (open) {
      if (player) {
        form.setFieldsValue(player);
      } else {
        form.resetFields();
        form.setFieldsValue({
          sold: false,
          price: 0,
          matches: 0,
          runs: 0,
          wickets: 0,
          strikeRate: 0,
        });
      }
    }
  }, [open, player, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (isNew) {
        addPlayer({
          ...values,
          photo: `/player-photos/player-${String(Date.now()).slice(-2)}.svg`,
        });
      } else {
        updatePlayer(player.id, values);
      }
      onClose();
    });
  };

  return (
    <Modal
      title={isNew ? 'Add New Player' : `Edit — ${player?.name}`}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Player name is required' }]}
        >
          <Input placeholder="Full name" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select role"
              options={ROLES.map((r) => ({ value: r, label: r }))}
            />
          </Form.Item>
          <Form.Item name="team" label="Team" style={{ flex: 1 }}>
            <Select
              placeholder="Unassigned"
              allowClear
              options={teams.map((t) => ({ value: t.name, label: t.name }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Player bio" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Form.Item
            name="basePrice"
            label="Base Price (₹)"
            rules={[{ required: true }]}
            style={{ flex: 1, minWidth: 140 }}
          >
            <InputNumber min={0} step={50000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Sold Price (₹)"
            style={{ flex: 1, minWidth: 140 }}
          >
            <InputNumber min={0} step={50000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="sold"
            label="Sold?"
            valuePropName="checked"
            style={{ flex: '0 0 80px' }}
          >
            <Switch />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Form.Item
            name="battingRating"
            label="Batting (1-5)"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="bowlingRating"
            label="Bowling (1-5)"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="fieldingRating"
            label="Fielding (1-5)"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} max={5} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Form.Item
            name="matches"
            label="Matches"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="runs"
            label="Runs"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="wickets"
            label="Wickets"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Form.Item
            name="battingAvg"
            label="Batting Avg"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="bowlingAvg"
            label="Bowling Avg"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="strikeRate"
            label="Strike Rate"
            style={{ flex: 1, minWidth: 100 }}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

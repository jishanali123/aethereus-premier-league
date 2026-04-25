import { Typography } from 'antd';
import PlayerTable from '../components/PlayerTable';

const { Title, Text } = Typography;

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Player Showcase
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Browse the league roster — click any player to view their full profile
        </Text>
      </div>
      <PlayerTable />
    </div>
  );
}

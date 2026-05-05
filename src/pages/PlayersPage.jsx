import { Typography } from 'antd';
import PlayerTable from '../components/PlayerTable';
import SuperStarsSection from '../components/SuperStarsSection';

const { Title, Text } = Typography;

export default function PlayersPage() {
  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ marginBottom: 6, fontSize: 38 }}>
          Player Showcase
        </Title>
        <Text type="secondary" style={{ fontSize: 18 }}>
          Browse the league roster — click any player to view their full
          profile
        </Text>
      </div>
      <SuperStarsSection />
      <PlayerTable />
    </div>
  );
}

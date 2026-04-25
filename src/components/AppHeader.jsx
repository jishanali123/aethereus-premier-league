import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Header
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!isHome && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ color: '#fff', fontSize: 16 }}
          />
        )}
        <Title
          level={4}
          style={{
            color: '#fff',
            margin: 0,
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}
          onClick={() => navigate('/')}
        >
          🏏 Society Cricket League
        </Title>
      </div>
      {!isHome && (
        <Button
          type="text"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Home
        </Button>
      )}
    </Header>
  );
}

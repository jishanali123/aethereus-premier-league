import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  MenuOutlined,
  InstagramOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

const NAV_ITEMS = [
  { key: '/', label: 'Home', icon: <HomeOutlined /> },
  { key: '/players', label: 'Players', icon: <TeamOutlined /> },
  { key: '/teams', label: 'Teams', icon: <TrophyOutlined /> },
  { key: '/insta/teams', label: 'Insta Cards', icon: <InstagramOutlined /> },
  { key: '/insta/fixtures', label: 'Fixtures Card', icon: <CalendarOutlined /> },
  { key: '/auction', label: 'Auction', icon: <ThunderboltOutlined />, disabled: true },
  { key: '/sponsors', label: 'Sponsors', icon: <GiftOutlined /> },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeKey =
    NAV_ITEMS.find(
      (item) =>
        item.key !== '/' && location.pathname.startsWith(item.key),
    )?.key ?? '/';

  const handleNav = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  return (
    <Header
      style={{
        background:
          'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        gap: 24,
      }}
    >
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <img
          src="/images/apl-logo.png"
          alt="Aethereus Premier League"
          style={{ height: 44, objectFit: 'contain' }}
        />
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 'clamp(14px, 2.5vw, 18px)',
            whiteSpace: 'nowrap',
            letterSpacing: 0.5,
          }}
        >
          APL
        </span>
      </div>

      {/* Desktop nav */}
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        onClick={handleNav}
        items={NAV_ITEMS}
        style={{
          flex: 1,
          background: 'transparent',
          borderBottom: 'none',
          minWidth: 0,
          justifyContent: 'flex-end',
        }}
        theme="dark"
        className="desktop-nav"
      />

      {/* Mobile hamburger */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setDrawerOpen(true)}
        className="mobile-nav-btn"
        style={{ color: '#fff', fontSize: 20, display: 'none' }}
      />

      <Drawer
        title="Aethereus Premier League"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
      >
        <Menu
          mode="vertical"
          selectedKeys={[activeKey]}
          onClick={handleNav}
          items={NAV_ITEMS}
          style={{ border: 'none' }}
        />
      </Drawer>
    </Header>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { LeagueProvider } from './context/LeagueContext';
import AppHeader from './components/AppHeader';
import LandingPage from './pages/LandingPage';
import PlayersPage from './pages/PlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import TeamsPage from './pages/TeamsPage';
import TeamInstaPostsPage from './pages/TeamInstaPostsPage';
import AuctionPage from './pages/AuctionPage';
import SponsorsPage from './pages/SponsorsPage';

const { Content, Footer } = Layout;

const theme = {
  token: {
    colorPrimary: '#302b63',
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <LeagueProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <AppHeader />
            <Content style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:id" element={<PlayerDetailPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/insta/teams" element={<TeamInstaPostsPage />} />
                <Route path="/auction" element={<AuctionPage />} />
                <Route path="/sponsors" element={<SponsorsPage />} />
              </Routes>
            </Content>
            <Footer
              style={{
                textAlign: 'center',
                background: '#fafafa',
                color: '#8c8c8c',
                fontSize: 13,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              Aethereus Premier League © {new Date().getFullYear()}
            </Footer>
          </Layout>
        </BrowserRouter>
      </LeagueProvider>
    </ConfigProvider>
  );
}

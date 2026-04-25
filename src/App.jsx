import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import AppHeader from './components/AppHeader';
import HomePage from './pages/HomePage';
import PlayerDetailPage from './pages/PlayerDetailPage';

const { Content, Footer } = Layout;

const theme = {
  token: {
    colorPrimary: '#1a1a2e',
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <AppHeader />
          <Content style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players/:id" element={<PlayerDetailPage />} />
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
            Society Cricket League © {new Date().getFullYear()}
          </Footer>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

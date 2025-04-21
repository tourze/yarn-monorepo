import '@testing-library/jest-dom';

// 全局模拟设置
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

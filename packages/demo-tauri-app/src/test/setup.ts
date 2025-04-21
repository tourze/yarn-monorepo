import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟 Tauri API
vi.mock('@tauri-apps/api', () => ({
  invoke: vi.fn(),
}));

// 模拟 Tauri 插件
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}));

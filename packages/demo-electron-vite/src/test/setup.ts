import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟 Electron 工具包
vi.mock('@electron-toolkit/preload', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

vi.mock('@electron-toolkit/utils', () => ({
  electronApp: {
    isPackaged: false,
    whenReady: vi.fn().mockResolvedValue({}),
  },
  optimizer: {
    watchWindowShortcuts: vi.fn(),
  },
}));

// 模拟 Electron APIs
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/path'),
    on: vi.fn(),
    quit: vi.fn(),
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    on: vi.fn(),
    webContents: {
      on: vi.fn(),
      openDevTools: vi.fn(),
    },
  })),
  ipcMain: {
    on: vi.fn(),
    handle: vi.fn(),
  },
  ipcRenderer: {
    on: vi.fn(),
    invoke: vi.fn(),
  },
})); 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders headline', () => {
    // 渲染App组件
    render(<App />);
    
    // 检查标题是否存在
    const headline = screen.getByText(/Welcome to Tauri \+ React/i);
    expect(headline).toBeInTheDocument();
  });

  it('renders logo section', () => {
    render(<App />);
    
    // 检查说明文本是否存在
    const logoText = screen.getByText(/Click on the Tauri, Vite, and React logos to learn more./i);
    expect(logoText).toBeInTheDocument();
  });

  it('renders input field and button', () => {
    render(<App />);
    
    // 检查输入框是否存在
    const inputElement = screen.getByPlaceholderText(/Enter a name.../i);
    expect(inputElement).toBeInTheDocument();
    
    // 检查按钮是否存在
    const buttonElement = screen.getByText(/Greet/i);
    expect(buttonElement).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../src/context/AuthContext';
import { useContext } from 'react';
import * as sonner from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../src/services/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn().mockResolvedValue(null),
    refreshAccessToken: vi.fn().mockRejectedValue(new Error('No token')),
  },
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  let originalLocation;
  let originalEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalLocation = window.location;
    originalEnv = import.meta.env.VITE_API_URL;
    delete window.location;
    window.location = {
      assign: vi.fn(),
      href: '',
    };
  });

  afterEach(() => {
    window.location = originalLocation;
    import.meta.env.VITE_API_URL = originalEnv;
  });

  it('login action uses full browser navigation to API_URL/auth/github', () => {
    import.meta.env.VITE_API_URL = 'http://test.local/api';
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    act(() => {
      result.current.login();
    });

    expect(window.location.assign).toHaveBeenCalledWith('http://test.local/api/auth/github');
    expect(sonner.toast.error).not.toHaveBeenCalled();
  });

  it('missing API URL produces readable failure behavior and does not navigate', () => {
    import.meta.env.VITE_API_URL = '';
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    act(() => {
      result.current.login();
    });

    expect(window.location.assign).not.toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith('API URL is not configured. Add VITE_API_URL to frontend/.env and restart Vite.');
  });
});

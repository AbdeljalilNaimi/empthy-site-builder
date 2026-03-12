// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { mockUser } from '@/test/mocks/firebase';

// Mock the entire AuthContext to control its values
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockedUseAuth = vi.mocked(useAuth);

const ProtectedPage = () => <div data-testid="protected">Protected Content</div>;
const LoginPage = () => <div data-testid="login">Login Page</div>;

const renderProtectedRoute = (requireRole) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requireRole={requireRole}>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when auth is loading', () => {
      mockedUseAuth.mockReturnValue({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn(),
      });

      renderProtectedRoute();

      expect(screen.getByText("Vérification de l'authentification...")).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('redirects to login page when not authenticated', () => {
      mockedUseAuth.mockReturnValue({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn(),
      });

      renderProtectedRoute();

      expect(screen.getByTestId('login')).toBeInTheDocument();
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('renders protected content when authenticated', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        profile: {
          id: mockUser.uid,
          email: mockUser.email,
          full_name: 'Test User',
          avatar_url: null,
          roles: ['patient'],
        },
        session: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn(() => true),
      });

      renderProtectedRoute();

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('shows access denied when user lacks required role', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        profile: {
          id: mockUser.uid,
          email: mockUser.email,
          full_name: 'Test User',
          avatar_url: null,
          roles: ['patient'],
        },
        session: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn((role) => role === 'patient'),
      });

      renderProtectedRoute('admin');

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(screen.getByText(/nécessite le rôle "Administrateur"/)).toBeInTheDocument();
    });

    it('allows access when user has required role', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        profile: {
          id: mockUser.uid,
          email: mockUser.email,
          full_name: 'Test User',
          avatar_url: null,
          roles: ['admin'],
        },
        session: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn((role) => role === 'admin'),
      });

      renderProtectedRoute('admin');

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('shows loading when waiting for profile with required role', () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        profile: null,
        session: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
        hasRole: vi.fn(),
      });

      renderProtectedRoute('admin');

      expect(screen.getByText('Chargement du profil...')).toBeInTheDocument();
    });
  });
});

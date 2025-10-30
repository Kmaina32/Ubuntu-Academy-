
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { useAuth } from '@/hooks/use-auth';

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock the SidebarTrigger component
jest.mock('@/components/ui/sidebar', () => ({
    ...jest.requireActual('@/components/ui/sidebar'),
    SidebarTrigger: () => <button>Sidebar Trigger</button>
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: jest.fn(),
    }),
    usePathname: () => '/'
}));

describe('Header', () => {
  it('shows Login and Sign Up buttons when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    render(<Header />);
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('shows user avatar and menu when user is logged in', () => {
    const mockUser = {
      displayName: 'Jomo Kenyatta',
      email: 'jomo@manda.network',
      photoURL: 'https://example.com/avatar.png',
    };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    render(<Header />);
    expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
  });

   it('shows skeleton loaders when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    render(<Header />);
    expect(screen.getByTestId('auth-skeleton')).toBeInTheDocument();
  });
});

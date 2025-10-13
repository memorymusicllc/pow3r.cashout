/**
 * Providers Component
 * Application-wide providers wrapper (Theme, Auth, etc.)
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Core
 * @tags providers, context, theme, auth
 */

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="pow3r-cashout-theme"
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

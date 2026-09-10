import { AuthProvider } from '../context/AuthContext';
import { RepositoryProvider } from '../context/RepositoryContext';
import { ScanProvider } from '../context/ScanContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <RepositoryProvider>
        <ScanProvider>
          {children}
        </ScanProvider>
      </RepositoryProvider>
    </AuthProvider>
  );
}

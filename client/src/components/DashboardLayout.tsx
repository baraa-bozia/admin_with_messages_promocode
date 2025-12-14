import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-72 pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

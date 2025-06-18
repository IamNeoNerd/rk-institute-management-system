'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

// Critical SSR workaround: Pure client-side component to completely avoid vendor bundle issues
export default function PeopleHubPage() {
  const [ClientComponent, setClientComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Load the client component only after hydration
    import('./client-page').then((module) => {
      setClientComponent(() => module.default);
    });
  }, []);

  if (!ClientComponent) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading people management...</span>
        </div>
      </AdminLayout>
    );
  }

  return <ClientComponent />;
}

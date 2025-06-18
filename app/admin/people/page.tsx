import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';

// Critical SSR workaround: Load entire page client-side to avoid vendor bundle issues
const PeopleHubClientPage = dynamic(() => import('./client-page'), {
  ssr: false,
  loading: () => (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading people management...</span>
      </div>
    </AdminLayout>
  )
});

export default PeopleHubClientPage;

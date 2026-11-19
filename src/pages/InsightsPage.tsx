import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { AnalyticsPage } from './AnalyticsPage';
import { HistoryPage } from './HistoryPage';
import { TrendingUp, History } from 'lucide-react';

interface InsightsPageProps {
  defaultTab?: 'analytics' | 'history';
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ defaultTab = 'analytics' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab = (rawTab === 'analytics' || rawTab === 'history') ? rawTab : defaultTab;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Insights Hub Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Insights & History
          </h1>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedTabs
            value={currentTab}
            onChange={handleTabChange}
            options={[
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'history', label: 'Study History', icon: <History className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      {/* Tab Content View */}
      <div>
        {currentTab === 'analytics' ? <AnalyticsPage /> : <HistoryPage />}
      </div>
    </div>
  );
};

export default InsightsPage;

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { WeeklyPlannerPage } from './WeeklyPlannerPage';
import { TopicTrackerPage } from './TopicTrackerPage';
import { Calendar, CheckSquare } from 'lucide-react';

interface PlanPageProps {
  defaultTab?: 'planner' | 'topics';
}

export const PlanPage: React.FC<PlanPageProps> = ({ defaultTab = 'planner' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab = (rawTab === 'topics' || rawTab === 'planner') ? rawTab : defaultTab;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Plan Hub Header & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Plan & Preparation Roadmap
          </h1>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedTabs
            value={currentTab}
            onChange={handleTabChange}
            options={[
              { id: 'planner', label: 'Weekly Planner', icon: <Calendar className="h-4 w-4" /> },
              { id: 'topics', label: 'Topics', icon: <CheckSquare className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      {/* Tab Content View */}
      <div>
        {currentTab === 'planner' ? <WeeklyPlannerPage /> : <TopicTrackerPage />}
      </div>
    </div>
  );
};

export default PlanPage;

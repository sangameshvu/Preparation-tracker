import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { CATPracticeEngine } from '../components/practice/CATPracticeEngine';
import { MockTrackerPage } from './MockTrackerPage';
import { MistakeLogPage } from './MistakeLogPage';
import { Target, Award, AlertTriangle } from 'lucide-react';

interface PracticePageProps {
  defaultTab?: 'practice' | 'mocks' | 'mistakes';
}

export const PracticePage: React.FC<PracticePageProps> = ({ defaultTab = 'practice' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab = (rawTab === 'practice' || rawTab === 'mocks' || rawTab === 'mistakes') ? rawTab : defaultTab;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Practice Hub Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Practice & Test Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            CAT PYQ & AI topic drills, full simulated mock exams, and spaced repetition error log.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedTabs
            value={currentTab}
            onChange={handleTabChange}
            options={[
              { id: 'practice', label: 'Topic Practice', icon: <Target className="h-4 w-4" /> },
              { id: 'mocks', label: 'Mocks', icon: <Award className="h-4 w-4" /> },
              { id: 'mistakes', label: 'Mistakes', icon: <AlertTriangle className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      {/* Tab Content View */}
      <div>
        {currentTab === 'practice' && (
          <CATPracticeEngine onSwitchToMistakes={() => handleTabChange('mistakes')} />
        )}
        {currentTab === 'mocks' && <MockTrackerPage />}
        {currentTab === 'mistakes' && <MistakeLogPage />}
      </div>
    </div>
  );
};

export default PracticePage;

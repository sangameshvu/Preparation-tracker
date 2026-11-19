import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { CATPracticeEngine } from '../components/practice/CATPracticeEngine';
import { MockTrackerPage } from './MockTrackerPage';
import { MistakeLogPage } from './MistakeLogPage';
import { Target, Award, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';

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
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <a
            href="https://aeon.co/essays"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs"
            title="Read today's published long-form essay on Aeon (2,500–4,000 words)"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Today's Aeon Essay</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

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

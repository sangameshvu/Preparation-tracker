import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { NotesPage } from './NotesPage';
import { StickyBoardPage } from './StickyBoardPage';
import { FileText, StickyNote } from 'lucide-react';

interface NotesContainerPageProps {
  defaultTab?: 'notes' | 'sticky-board';
}

export const NotesContainerPage: React.FC<NotesContainerPageProps> = ({ defaultTab = 'notes' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab = (rawTab === 'notes' || rawTab === 'sticky-board') ? rawTab : defaultTab;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Notes Hub Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Study Notes & Sticky Board
          </h1>
        </div>

        <div className="w-full sm:w-auto">
          <SegmentedTabs
            value={currentTab}
            onChange={handleTabChange}
            options={[
              { id: 'notes', label: 'Study Notes', icon: <FileText className="h-4 w-4" /> },
              { id: 'sticky-board', label: 'Sticky Board', icon: <StickyNote className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      {/* Tab Content View */}
      <div>
        {currentTab === 'notes' ? <NotesPage /> : <StickyBoardPage />}
      </div>
    </div>
  );
};

export default NotesContainerPage;

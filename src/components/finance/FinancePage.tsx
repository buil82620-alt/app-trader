import { useState } from 'react';
import FinanceHeader from './FinanceHeader';
import AIMiningTab from './AIMiningTab';
import IEOLaunchpadTab from './IEOLaunchpadTab';

type Tab = 'ai-mining' | 'ieo-launchpad';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('ai-mining');

  return (
    <div className="bg-gray-900 min-h-screen">
      <FinanceHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'ai-mining' ? <AIMiningTab /> : <IEOLaunchpadTab />}
    </div>
  );
}

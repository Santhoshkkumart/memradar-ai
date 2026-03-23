import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HypeReplay from './components/HypeReplay';
import CoinCompare from './components/CoinCompare';
import TickerTape from './components/TickerTape';
import useCoins from './hooks/useCoins';
import useSentiment from './hooks/useSentiment';
import useAlerts from './hooks/useAlerts';
import useLivePrices from './hooks/useLivePrices';
import useMemeStore from './store/useMemeStore';
import FlowField from './components/ui/FlowField';

export default function App() {
  useCoins();
  useSentiment();
  useAlerts();
  useLivePrices();

  const { activeTab: storeActiveTab, setActiveTab } = useMemeStore();
  const [viewTab, setViewTab] = useState(storeActiveTab || 'dashboard');

  const activeTab = viewTab || storeActiveTab;

  return (
    <div className="min-h-screen bg-bg text-text relative overflow-x-hidden">
      {/* Background with z-0 */}
      <div className="fixed inset-0 z-0">
        <FlowField theme="ocean" className="w-full h-full opacity-40" />
      </div>
      
      {/* Content with relative z-10 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onTabChange={(tab) => {
            setViewTab(tab);
            setActiveTab(tab);
          }}
        />
        
        <div className="flex-grow flex flex-col w-full">
          <main className="flex-grow pb-16 px-4 max-w-[1600px] mx-auto w-full pt-14">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'replay' && <HypeReplay />}
            {activeTab === 'compare' && <CoinCompare />}
          </main>
        </div>
        
        <TickerTape />
      </div>
    </div>
  );
}

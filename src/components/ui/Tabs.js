"use client";
import { useState } from 'react';

export default function Tabs({ tabs, defaultTab, onTabChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 !text-blue-600"
                : "border-transparent !text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

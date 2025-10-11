import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

/**
 * Tabs Component for switching between different tools
 */
export const Tabs: FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={clsx('tab-button', activeTab === tab.id && 'tab-button-active')}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx('tab-panel', activeTab === tab.id && 'tab-panel-active')}
            role="tabpanel"
            hidden={activeTab !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

import { FC, useState } from 'react';
import { Tabs, Tab } from '@components/common/Tabs';
import { Base64Tool } from '@components/tools/Base64Tool';
import { UrlTool } from '@components/tools/UrlTool';
import { JsonTool } from '@components/tools/JsonTool';
import { HashTool } from '@components/tools/HashTool';
import { TimestampTool } from '@components/tools/TimestampTool';
import { UnicodeTool } from '@components/tools/UnicodeTool';
import { ColorTool } from '@components/tools/ColorTool';
import { RegexTool } from '@components/tools/RegexTool';
import './App.css';

/**
 * Main Application Component with Tab-based Navigation
 */
const App: FC = () => {
  const [activeTab, setActiveTab] = useState('base64');

  const tabs: Tab[] = [
    {
      id: 'base64',
      label: 'Base64',
      icon: '🔐',
      content: <Base64Tool />,
    },
    {
      id: 'url',
      label: 'URL',
      icon: '🔗',
      content: <UrlTool />,
    },
    {
      id: 'json',
      label: 'JSON',
      icon: '📋',
      content: <JsonTool />,
    },
    {
      id: 'hash',
      label: 'Hash',
      icon: '🔑',
      content: <HashTool />,
    },
    {
      id: 'timestamp',
      label: '时间戳',
      icon: '⏰',
      content: <TimestampTool />,
    },
    {
      id: 'unicode',
      label: 'Unicode',
      icon: '🔤',
      content: <UnicodeTool />,
    },
    {
      id: 'color',
      label: '颜色',
      icon: '🎨',
      content: <ColorTool />,
    },
    {
      id: 'regex',
      label: '正则',
      icon: '🔍',
      content: <RegexTool />,
    },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🛠️ 开发者工具箱</h1>
        <p className="app-subtitle">Developer Toolbox</p>
      </header>

      <main className="app-main">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </main>
    </div>
  );
};

export default App;

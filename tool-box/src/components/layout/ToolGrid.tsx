import { FC } from 'react';
import { TOOLS } from '@constants/tools';
import type { ToolMetadata } from '../../types/tools';
import './ToolGrid.css';

export interface ToolGridProps {
  onToolSelect: (tool: ToolMetadata) => void;
}

/**
 * Tool Grid Component - displays all available tools
 */
export const ToolGrid: FC<ToolGridProps> = ({ onToolSelect }) => {
  return (
    <div className="tool-grid-container">
      <header className="tool-grid-header">
        <h1 className="main-title">🛠️ 开发者工具箱</h1>
        <p className="main-subtitle">Developer Toolbox - 常用开发工具集合</p>
      </header>

      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="tool-card"
            onClick={() => onToolSelect(tool)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onToolSelect(tool);
              }
            }}
          >
            <h3 className="tool-card-title">
              <span className="tool-card-icon">{tool.icon}</span>
              {tool.name}
            </h3>
            <p className="tool-card-description">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

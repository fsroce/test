import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import './ToolLayout.css';

/**
 * Regex Tester Tool Component
 */
export const RegexTool: FC = () => {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [output, setOutput] = useState('');
  const [globalFlag, setGlobalFlag] = useState(true);
  const [ignoreCaseFlag, setIgnoreCaseFlag] = useState(false);
  const [multilineFlag, setMultilineFlag] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleTest = () => {
    try {
      if (!pattern) {
        showStatus('请输入正则表达式', true);
        return;
      }

      if (!testText) {
        showStatus('请输入测试文本', true);
        return;
      }

      let flags = '';
      if (globalFlag) flags += 'g';
      if (ignoreCaseFlag) flags += 'i';
      if (multilineFlag) flags += 'm';

      const regex = new RegExp(pattern, flags);
      const matches = testText.match(regex);

      if (matches && matches.length > 0) {
        let result = `✓ 匹配成功！找到 ${matches.length} 个匹配项：\n\n`;
        matches.forEach((match, index) => {
          result += `匹配 ${index + 1}: ${match}\n`;
        });

        // 也显示所有匹配的位置
        const positions: number[] = [];
        let match;
        const globalRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
        while ((match = globalRegex.exec(testText)) !== null) {
          positions.push(match.index);
          if (!flags.includes('g')) break;
        }

        if (positions.length > 0) {
          result += `\n匹配位置: ${positions.join(', ')}`;
        }

        setOutput(result);
        showStatus('测试完成！');
      } else {
        setOutput('✗ 未找到匹配项');
        showStatus('未找到匹配项', true);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '测试失败';
      setOutput(`错误: ${errorMsg}`);
      showStatus('测试失败: ' + errorMsg, true);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setOutput('');
    setStatus(null);
  };

  return (
    <div className="tool-content">
      <div>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          正则表达式
        </label>
        <input
          type="text"
          placeholder="输入正则表达式，例如：^\d{3}-\d{4}$"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        />

        <div className="options" style={{ marginBottom: '15px' }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={globalFlag}
              onChange={(e) => setGlobalFlag(e.target.checked)}
            />
            g (全局)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ignoreCaseFlag}
              onChange={(e) => setIgnoreCaseFlag(e.target.checked)}
            />
            i (忽略大小写)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={multilineFlag}
              onChange={(e) => setMultilineFlag(e.target.checked)}
            />
            m (多行)
          </label>
        </div>
      </div>

      <TextArea
        label="测试文本"
        placeholder="输入要测试的文本..."
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
      />

      <div className="controls">
        <Button variant="primary" onClick={handleTest}>
          测试匹配
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
        </Button>
      </div>

      {output && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            minHeight: '100px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
          }}
        >
          {output}
        </div>
      )}

      {status && (
        <div className={`status ${status.isError ? 'status-error' : 'status-success'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import './ToolLayout.css';

/**
 * Unicode Converter Tool Component
 */
export const UnicodeTool: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const textToUnicode = () => {
    try {
      if (!input) {
        showStatus('请输入文本', true);
        return;
      }

      const unicode = input
        .split('')
        .map((char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
        .join('');

      setOutput(unicode);
      showStatus('转换成功！');
    } catch (error) {
      showStatus('转换失败', true);
    }
  };

  const unicodeToText = () => {
    try {
      if (!input) {
        showStatus('请输入Unicode编码', true);
        return;
      }

      const text = input.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });

      setOutput(text);
      showStatus('转换成功！');
    } catch (error) {
      showStatus('转换失败', true);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      showStatus('已复制到剪贴板！');
    } catch {
      showStatus('复制失败', true);
    }
  };

  return (
    <div className="tool-content">
      <div className="io-grid">
        <TextArea
          label="输入文本"
          placeholder="输入文本或Unicode编码..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <TextArea label="输出结果" placeholder="结果将显示在这里..." value={output} readOnly />
      </div>

      <div className="controls">
        <Button variant="primary" onClick={textToUnicode}>
          文本 → Unicode
        </Button>
        <Button variant="primary" onClick={unicodeToText}>
          Unicode → 文本
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
        </Button>
        <Button variant="success" onClick={handleCopy} disabled={!output}>
          复制结果
        </Button>
      </div>

      {status && (
        <div className={`status ${status.isError ? 'status-error' : 'status-success'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

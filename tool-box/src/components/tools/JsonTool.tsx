import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import { formatJson, minifyJson, validateJson } from '@utils/formatters/json';
import './ToolLayout.css';

/**
 * JSON Formatter Tool Component
 */
export const JsonTool: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [indent, setIndent] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleFormat = () => {
    const result = formatJson(input, { indent, sortKeys });
    if (result.success && result.data) {
      setOutput(result.data);
      showStatus('格式化成功！');
    } else {
      showStatus(result.error || '格式化失败', true);
    }
  };

  const handleMinify = () => {
    const result = minifyJson(input);
    if (result.success && result.data) {
      setOutput(result.data);
      showStatus('压缩成功！');
    } else {
      showStatus(result.error || '压缩失败', true);
    }
  };

  const handleValidate = () => {
    const result = validateJson(input);
    if (result.success) {
      showStatus('JSON格式正确！✓');
    } else {
      showStatus(result.error || 'JSON格式错误', true);
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
          label="输入JSON"
          placeholder='输入JSON数据，例如：{"name":"张三","age":25}'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <TextArea label="输出结果" placeholder="结果将显示在这里..." value={output} readOnly />
      </div>

      <div className="options">
        <label className="checkbox-label">
          <input
            type="radio"
            name="indent"
            checked={indent === 2}
            onChange={() => setIndent(2)}
          />
          2空格缩进
        </label>
        <label className="checkbox-label">
          <input
            type="radio"
            name="indent"
            checked={indent === 4}
            onChange={() => setIndent(4)}
          />
          4空格缩进
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
          键排序
        </label>
      </div>

      <div className="controls">
        <Button variant="primary" onClick={handleFormat}>
          格式化
        </Button>
        <Button variant="primary" onClick={handleMinify}>
          压缩
        </Button>
        <Button variant="primary" onClick={handleValidate}>
          验证
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

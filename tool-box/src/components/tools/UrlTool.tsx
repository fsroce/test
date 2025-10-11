import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import { encodeUrl, decodeUrl } from '@utils/encoders/url';
import './ToolLayout.css';

/**
 * URL Encoding/Decoding Tool Component
 */
export const UrlTool: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleEncode = () => {
    const result = encodeUrl(input);
    if (result.success && result.data) {
      setOutput(result.data);
      showStatus('编码成功！');
    } else {
      showStatus(result.error || '编码失败', true);
    }
  };

  const handleDecode = () => {
    const result = decodeUrl(input);
    if (result.success && result.data) {
      setOutput(result.data);
      showStatus('解码成功！');
    } else {
      showStatus(result.error || '解码失败', true);
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
          label="输入URL"
          placeholder="输入要编码或解码的URL..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <TextArea label="输出结果" placeholder="结果将显示在这里..." value={output} readOnly />
      </div>

      <div className="controls">
        <Button variant="primary" onClick={handleEncode}>
          URL编码
        </Button>
        <Button variant="primary" onClick={handleDecode}>
          URL解码
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

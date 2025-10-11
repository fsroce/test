import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import { encodeBase64, decodeBase64 } from '@utils/encoders/base64';
import './ToolLayout.css';

/**
 * Base64 Encoding/Decoding Tool Component
 */
export const Base64Tool: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [urlSafe, setUrlSafe] = useState(false);

  const handleEncode = () => {
    const result = encodeBase64(input, { urlSafe });

    if (result.success && result.data) {
      setOutput(result.data);
      setStatus({ message: '编码成功！', isError: false });
    } else {
      setStatus({ message: result.error || '编码失败', isError: true });
    }

    // Auto-hide status after 3 seconds
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDecode = () => {
    const result = decodeBase64(input, { urlSafe });

    if (result.success && result.data) {
      setOutput(result.data);
      setStatus({ message: '解码成功！', isError: false });
    } else {
      setStatus({ message: result.error || '解码失败', isError: true });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setStatus({ message: '已复制到剪贴板！', isError: false });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ message: '复制失败', isError: true });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="tool-title">🔐 Base64 编码/解码</h2>
      </div>

      <div className="tool-content">
        <div className="io-grid">
          <TextArea
            label="输入文本"
            placeholder="输入要编码或解码的文本..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <TextArea
            label="输出结果"
            placeholder="结果将显示在这里..."
            value={output}
            readOnly
          />
        </div>

        <div className="options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
            />
            URL安全模式
          </label>
        </div>

        <div className="controls">
          <Button variant="primary" onClick={handleEncode}>
            编码 (Encode)
          </Button>
          <Button variant="primary" onClick={handleDecode}>
            解码 (Decode)
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
    </div>
  );
};

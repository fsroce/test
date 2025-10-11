import { FC, useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import { TextArea } from '@components/common/TextArea';
import { generateMultipleHashes } from '@utils/converters/hash';
import type { HashAlgorithm } from '../../types/tools';
import './ToolLayout.css';

/**
 * Hash Generator Tool Component
 */
export const HashTool: FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
    'MD5': '',
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': '',
  });
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleGenerate = async () => {
    if (!input) {
      showStatus('请输入文本', true);
      return;
    }

    try {
      const results = await generateMultipleHashes(input, ['SHA-1', 'SHA-256', 'SHA-512']);

      setHashes({
        'MD5': 'MD5不支持（Web Crypto API限制）',
        'SHA-1': results['SHA-1'].success ? results['SHA-1'].data! : results['SHA-1'].error!,
        'SHA-256': results['SHA-256'].success
          ? results['SHA-256'].data!
          : results['SHA-256'].error!,
        'SHA-512': results['SHA-512'].success
          ? results['SHA-512'].data!
          : results['SHA-512'].error!,
      });

      showStatus('哈希生成成功！');
    } catch (error) {
      showStatus('生成失败', true);
    }
  };

  const handleClear = () => {
    setInput('');
    setHashes({
      'MD5': '',
      'SHA-1': '',
      'SHA-256': '',
      'SHA-512': '',
    });
    setStatus(null);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showStatus('已复制到剪贴板！');
    } catch {
      showStatus('复制失败', true);
    }
  };

  // Auto-generate on input change
  useEffect(() => {
    if (input) {
      const timer = setTimeout(() => {
        handleGenerate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [input]);

  return (
    <div className="tool-content">
      <div className="io-section">
        <TextArea
          label="输入文本"
          placeholder="输入要生成哈希的文本..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="controls">
        <Button variant="primary" onClick={handleGenerate}>
          生成哈希
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
        </Button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>
              {algo}:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <textarea
                readOnly
                value={hash}
                style={{
                  flex: 1,
                  height: '60px',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  resize: 'none',
                }}
              />
              <Button
                variant="success"
                size="small"
                onClick={() => handleCopy(hash)}
                disabled={!hash || hash.includes('不支持')}
              >
                复制
              </Button>
            </div>
          </div>
        ))}
      </div>

      {status && (
        <div className={`status ${status.isError ? 'status-error' : 'status-success'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

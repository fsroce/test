import { FC, useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import {
  getCurrentTimestamp,
  timestampToDate,
  dateToTimestamp,
} from '@utils/converters/timestamp';
import './ToolLayout.css';

/**
 * Timestamp Converter Tool Component
 */
export const TimestampTool: FC = () => {
  const [current, setCurrent] = useState(getCurrentTimestamp());
  const [timestampInput, setTimestampInput] = useState('');
  const [timestampOutput, setTimestampOutput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dateOutput, setDateOutput] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampToDate = () => {
    const result = timestampToDate(Number(timestampInput));
    if (result.success && result.data) {
      const info = result.data;
      const output = `日期时间: ${info.date}
ISO格式: ${info.iso}
年: ${info.year}
月: ${info.month}
日: ${info.day}
时: ${info.hour}
分: ${info.minute}
秒: ${info.second}`;
      setTimestampOutput(output);
      showStatus('转换成功！');
    } else {
      showStatus(result.error || '转换失败', true);
    }
  };

  const handleDateToTimestamp = () => {
    const result = dateToTimestamp(dateInput);
    if (result.success && result.data) {
      const info = result.data;
      const output = `Unix时间戳（秒）: ${info.timestamp}
Unix时间戳（毫秒）: ${info.timestampMs}
ISO格式: ${info.iso}`;
      setDateOutput(output);
      showStatus('转换成功！');
    } else {
      showStatus(result.error || '转换失败', true);
    }
  };

  return (
    <div className="tool-content">
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#667eea' }}>当前时间</h3>
        <div style={{ display: 'grid', gap: '10px', fontSize: '0.95rem' }}>
          <p>
            <strong>Unix时间戳（秒）:</strong> {current.timestamp}
          </p>
          <p>
            <strong>Unix时间戳（毫秒）:</strong> {current.timestampMs}
          </p>
          <p>
            <strong>当前时间:</strong> {current.date}
          </p>
          <p>
            <strong>ISO格式:</strong> {current.iso}
          </p>
        </div>
      </div>

      <div className="io-grid">
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            时间戳转日期
          </label>
          <input
            type="text"
            placeholder="输入Unix时间戳（秒或毫秒）"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <Button variant="primary" onClick={handleTimestampToDate} fullWidth>
            转换为日期
          </Button>
          <textarea
            readOnly
            value={timestampOutput}
            placeholder="转换结果..."
            style={{
              width: '100%',
              height: '150px',
              marginTop: '10px',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            日期转时间戳
          </label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <Button variant="primary" onClick={handleDateToTimestamp} fullWidth>
            转换为时间戳
          </Button>
          <textarea
            readOnly
            value={dateOutput}
            placeholder="转换结果..."
            style={{
              width: '100%',
              height: '150px',
              marginTop: '10px',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      {status && (
        <div className={`status ${status.isError ? 'status-error' : 'status-success'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

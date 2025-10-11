import { FC, useState } from 'react';
import { Button } from '@components/common/Button';
import {
  hexToRgb,
  rgbToHex,
  parseRgbString,
  rgbToHsl,
  formatRgbString,
  formatHslString,
} from '@utils/converters/color';
import './ToolLayout.css';

/**
 * Color Converter Tool Component
 */
export const ColorTool: FC = () => {
  const [hexInput, setHexInput] = useState('#667eea');
  const [rgbInput, setRgbInput] = useState('rgb(102, 126, 234)');
  const [hslOutput, setHslOutput] = useState('');
  const [previewColor, setPreviewColor] = useState('#667eea');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleHexToRgb = () => {
    const result = hexToRgb(hexInput);
    if (result.success && result.data) {
      const rgbStr = formatRgbString(result.data);
      setRgbInput(rgbStr);
      setPreviewColor(hexInput);

      // Also convert to HSL
      const hslResult = rgbToHsl(result.data);
      if (hslResult.success && hslResult.data) {
        setHslOutput(formatHslString(hslResult.data));
      }

      showStatus('转换成功！');
    } else {
      showStatus(result.error || '转换失败', true);
    }
  };

  const handleRgbToHex = () => {
    const parseResult = parseRgbString(rgbInput);
    if (parseResult.success && parseResult.data) {
      const hexResult = rgbToHex(parseResult.data);
      if (hexResult.success && hexResult.data) {
        setHexInput(hexResult.data);
        setPreviewColor(hexResult.data);

        // Also convert to HSL
        const hslResult = rgbToHsl(parseResult.data);
        if (hslResult.success && hslResult.data) {
          setHslOutput(formatHslString(hslResult.data));
        }

        showStatus('转换成功！');
      } else {
        showStatus(hexResult.error || '转换失败', true);
      }
    } else {
      showStatus(parseResult.error || '转换失败', true);
    }
  };

  const handleColorPickerChange = (color: string) => {
    setHexInput(color);
    setPreviewColor(color);
    const result = hexToRgb(color);
    if (result.success && result.data) {
      setRgbInput(formatRgbString(result.data));

      const hslResult = rgbToHsl(result.data);
      if (hslResult.success && hslResult.data) {
        setHslOutput(formatHslString(hslResult.data));
      }
    }
  };

  const handleClear = () => {
    setHexInput('');
    setRgbInput('');
    setHslOutput('');
    setPreviewColor('#ffffff');
  };

  return (
    <div className="tool-content">
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          选择颜色
        </label>
        <input
          type="color"
          value={previewColor}
          onChange={(e) => handleColorPickerChange(e.target.value)}
          style={{
            width: '100px',
            height: '50px',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100px',
            background: previewColor,
            borderRadius: '6px',
            marginTop: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #e0e0e0',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>
            HEX颜色
          </label>
          <input
            type="text"
            placeholder="#667eea"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>
            RGB颜色
          </label>
          <input
            type="text"
            placeholder="rgb(102, 126, 234)"
            value={rgbInput}
            onChange={(e) => setRgbInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>
            HSL颜色（只读）
          </label>
          <input
            type="text"
            placeholder="hsl(230, 75%, 66%)"
            value={hslOutput}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#f8f9fa',
            }}
          />
        </div>
      </div>

      <div className="controls" style={{ marginTop: '20px' }}>
        <Button variant="primary" onClick={handleHexToRgb}>
          HEX → RGB/HSL
        </Button>
        <Button variant="primary" onClick={handleRgbToHex}>
          RGB → HEX/HSL
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
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

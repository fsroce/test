import { FC, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import './TextArea.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * Reusable TextArea component
 */
export const TextArea: FC<TextAreaProps> = ({
  label,
  error,
  fullWidth = true,
  className,
  ...props
}) => {
  return (
    <div className={clsx('textarea-wrapper', fullWidth && 'textarea-full-width')}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea className={clsx('textarea', error && 'textarea-error', className)} {...props} />
      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
};

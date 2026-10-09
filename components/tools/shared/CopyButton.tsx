import React from 'react';
import { IconCheck, IconCopy } from '../../Icons';
import { useCopy } from './useCopy';

interface CopyButtonProps {
  /** Text to copy, or a getter for text that is too expensive to build on every render. */
  text: string | (() => string);
  /** Tooltip, already localized by the caller. */
  title: string;
  /** Omit for an icon-only button. */
  label?: string;
  /** Swapped in for `label` while the copied flag is up. */
  copiedLabel?: string;
  /** Replaces the default muted/hover colours wholesale, so palettes never fight. */
  className?: string;
  iconClassName?: string;
  /** Only needed when the button has no visible label to name it. */
  ariaLabel?: string;
  disabled?: boolean;
  resetMs?: number;
}

/** The copy affordance every tool shares: icon swap, optional label swap, 2s reset. */
const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  title,
  label,
  copiedLabel,
  className = 'text-slate-500 hover:text-primary-400',
  iconClassName = 'w-4 h-4',
  ariaLabel,
  disabled = false,
  resetMs = 2000,
}) => {
  const { copied, copy } = useCopy(resetMs);

  return (
    <button
      type="button"
      onClick={() => copy(typeof text === 'function' ? text() : text)}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`flex items-center gap-1 transition-colors disabled:opacity-30 ${className}`}
    >
      {copied ? <IconCheck className={`${iconClassName} text-green-500`} /> : <IconCopy className={iconClassName} />}
      {label && <span>{copied ? (copiedLabel ?? label) : label}</span>}
    </button>
  );
};

export default CopyButton;

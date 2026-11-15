import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-600">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-2xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'block w-full rounded-lg border bg-white px-3 py-1.5 text-xs text-slate-800 font-normal placeholder-slate-400 transition-colors',
                'focus:outline-none focus:ring-1.5 focus:ring-blue-500 focus:border-blue-500',
                leftIcon ? 'pl-9' : '',
                rightIcon ? 'pr-9' : '',
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 hover:border-slate-300',
                props.disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-rose-500 font-normal">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-slate-400 font-normal">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

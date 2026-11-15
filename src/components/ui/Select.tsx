import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-600">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border bg-white px-3 py-1.5 text-xs text-slate-800 font-normal transition-colors',
              'focus:outline-none focus:ring-1.5 focus:ring-blue-500 focus:border-blue-500',
              error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300',
              props.disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-[11px] text-rose-500 font-normal">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

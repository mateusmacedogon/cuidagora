import type { ComponentProps, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type BaseProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
};

function FieldWrapper({ label, name, hint, error, required, children }: BaseProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
        {label}
        {required ? (
          <span className="ml-1 text-rose-500 font-bold" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">(opcional)</span>
        )}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-xs sm:text-sm text-slate-500 leading-normal">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 mt-0.5"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function TextField({
  label,
  name,
  hint,
  error,
  required,
  ...rest
}: BaseProps & ComponentProps<"input">) {
  return (
    <FieldWrapper label={label} name={name} hint={hint} error={error} required={required}>
      <input
        {...rest}
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className="field-control"
      />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  error,
  required,
  ...rest
}: BaseProps & ComponentProps<"textarea">) {
  return (
    <FieldWrapper label={label} name={name} hint={hint} error={error} required={required}>
      <textarea
        rows={3}
        {...rest}
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className="field-control"
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  name,
  hint,
  error,
  required,
  options,
  ...rest
}: BaseProps & ComponentProps<"select"> & { options: { value: string; label: string }[] }) {
  return (
    <FieldWrapper label={label} name={name} hint={hint} error={error} required={required}>
      <select
        {...rest}
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className="field-control"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  error,
  defaultChecked,
  ...rest
}: Omit<BaseProps, "children"> & ComponentProps<"input">) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <input
        {...rest}
        type="checkbox"
        id={name}
        name={name}
        defaultChecked={defaultChecked}
        aria-describedby={describedBy(name, hint, error)}
        className="mt-1 size-5 shrink-0 rounded border-slate-300 accent-teal-600 focus:ring-teal-500 cursor-pointer"
      />
      <div>
        <label htmlFor={name} className="text-sm sm:text-base font-semibold text-slate-900 cursor-pointer select-none">
          {label}
        </label>
        {hint ? (
          <p id={`${name}-hint`} className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${name}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 mt-1"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Fieldset({
  legend,
  hint,
  children,
  error,
}: {
  legend: string;
  hint?: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-base font-semibold text-slate-900">{legend}</legend>
      {hint ? <p className="text-xs sm:text-sm text-slate-500">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </fieldset>
  );
}

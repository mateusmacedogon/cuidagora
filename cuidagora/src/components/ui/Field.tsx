import type { ComponentProps, ReactNode } from "react";

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
      <label htmlFor={name} className="text-base font-semibold text-[var(--color-ink)]">
        {label}
        {required ? (
          <span className="ml-1 text-[var(--color-alert)]" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-sm font-normal text-[var(--color-ink-soft)]">(opcional)</span>
        )}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-sm text-[var(--color-ink-soft)]">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-alert)]">
          <span aria-hidden="true">⚠️</span>
          {error}
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
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <input
        {...rest}
        type="checkbox"
        id={name}
        name={name}
        defaultChecked={defaultChecked}
        aria-describedby={describedBy(name, hint, error)}
        className="mt-1 h-6 w-6 shrink-0 accent-[var(--color-brand)]"
      />
      <div>
        <label htmlFor={name} className="font-semibold">
          {label}
        </label>
        {hint ? (
          <p id={`${name}-hint`} className="text-sm text-[var(--color-ink-soft)]">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${name}-error`} role="alert" className="text-sm font-semibold text-[var(--color-alert)]">
            ⚠️ {error}
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
      <legend className="text-base font-semibold">{legend}</legend>
      {hint ? <p className="text-sm text-[var(--color-ink-soft)]">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-[var(--color-alert)]">
          ⚠️ {error}
        </p>
      ) : null}
    </fieldset>
  );
}

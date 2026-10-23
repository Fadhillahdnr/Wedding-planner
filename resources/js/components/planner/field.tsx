import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react';

interface FieldShellProps {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }) => ReactNode;
}

/** Label, petunjuk, dan pesan error terhubung lewat aria-describedby untuk semua jenis kontrol. */
function FieldShell({ label, error, hint, required, className, children }: FieldShellProps) {
    const id = useId();
    const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

    return (
        <div className={cn('grid gap-1.5', className)}>
            <Label htmlFor={id}>
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </Label>
            {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
            {hint && !error && (
                <p id={`${id}-hint`} className="text-ink-faint text-xs">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-err`} role="alert" className="text-danger text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

type Common = { label: string; error?: string; hint?: string; wrapperClassName?: string };

export function TextField({ label, error, hint, wrapperClassName, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <FieldShell label={label} error={error} hint={hint} required={props.required} className={wrapperClassName}>
            {(a11y) => <Input className="h-11" {...a11y} {...props} />}
        </FieldShell>
    );
}

const controlClass =
    'border-input bg-card text-ink focus-visible:ring-ring/40 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60';

export function SelectField({ label, error, hint, wrapperClassName, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <FieldShell label={label} error={error} hint={hint} required={props.required} className={wrapperClassName}>
            {(a11y) => (
                <select className={cn(controlClass, 'h-11')} {...a11y} {...props}>
                    {children}
                </select>
            )}
        </FieldShell>
    );
}

export function TextAreaField({ label, error, hint, wrapperClassName, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <FieldShell label={label} error={error} hint={hint} required={props.required} className={wrapperClassName}>
            {(a11y) => <textarea rows={3} className={cn(controlClass, 'py-2.5')} {...a11y} {...props} />}
        </FieldShell>
    );
}

interface MoneyFieldProps extends Common {
    value: number | null | '';
    onValueChange: (value: number | null) => void;
    name?: string;
    required?: boolean;
    disabled?: boolean;
}

/** Input rupiah: tampil "12.500.000", nilai yang dikirim selalu integer. */
export function MoneyField({ label, error, hint, wrapperClassName, value, onValueChange, ...props }: MoneyFieldProps) {
    const shown = value === null || value === '' ? '' : Number(value).toLocaleString('id-ID');

    return (
        <FieldShell label={label} error={error} hint={hint} required={props.required} className={wrapperClassName}>
            {(a11y) => (
                <div className="relative">
                    <span aria-hidden="true" className="text-ink-faint pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
                        Rp
                    </span>
                    <Input
                        className="num h-11 pl-10"
                        inputMode="numeric"
                        autoComplete="off"
                        value={shown}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            onValueChange(digits === '' ? null : Number(digits));
                        }}
                        {...a11y}
                        {...props}
                    />
                </div>
            )}
        </FieldShell>
    );
}

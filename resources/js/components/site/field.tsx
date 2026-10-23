import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

/** Input berlabel dengan pesan error yang terhubung via aria-describedby. */
export function Field({ label, error, hint, id, ...props }: FieldProps) {
    const fid = id ?? `f-${props.name}`;
    const describedBy = [error && `${fid}-err`, hint && `${fid}-hint`].filter(Boolean).join(' ') || undefined;

    return (
        <div className="grid gap-2">
            <Label htmlFor={fid}>
                {label}
                {props.required && <span aria-hidden="true"> *</span>}
            </Label>
            <Input id={fid} aria-invalid={!!error} aria-describedby={describedBy} className="h-11" {...props} />
            {hint && !error && (
                <p id={`${fid}-hint`} className="text-muted-foreground text-xs">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${fid}-err`} role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

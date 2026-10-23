import { Camera } from 'lucide-react';

/** Pengganti foto sampai media Cloudinary diunggah. Ukuran tetap agar tidak menggeser layout. */
export function PhotoPlaceholder({ label = 'Foto demo', className = '' }: { label?: string; className?: string }) {
    return (
        <div
            role="img"
            aria-label={label}
            className={`from-secondary to-accent text-muted-foreground relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${className}`}
        >
            <div className="flex flex-col items-center gap-2 text-xs tracking-widest uppercase">
                <Camera className="size-5" aria-hidden="true" />
                {label}
            </div>
        </div>
    );
}

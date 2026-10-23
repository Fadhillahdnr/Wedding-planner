import { useEffect, useState } from 'react';

function parts(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
}

/** Hitung mundur hidup: selalu dihitung ulang dari `targetAt` (ISO), bukan dikurangi dari angka tersimpan. */
export function LiveCountdown({ targetAt }: { targetAt: string }) {
    const target = new Date(targetAt).getTime();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const diff = target - now;
    if (diff <= 0) {
        return <p className="font-display text-4xl">Hari ini, atau sudah terlewati — selamat!</p>;
    }

    const p = parts(diff);
    const cells: [number, string][] = [
        [p.days, 'hari'],
        [p.hours, 'jam'],
        [p.minutes, 'menit'],
        [p.seconds, 'detik'],
    ];

    return (
        <div>
            {/* Angka yang berdetak tidak dibacakan pembaca layar; ringkasannya cukup. */}
            <p className="sr-only">{p.days} hari lagi menuju hari H.</p>
            <dl aria-hidden="true" className="flex gap-5 sm:gap-8">
                {cells.map(([value, unit]) => (
                    <div key={unit}>
                        <dd className="font-display num text-4xl leading-none font-medium sm:text-6xl">
                            {String(value).padStart(unit === 'hari' ? 1 : 2, '0')}
                        </dd>
                        <dt className="text-ink-soft mt-1 text-xs tracking-[0.14em] uppercase">{unit}</dt>
                    </div>
                ))}
            </dl>
        </div>
    );
}

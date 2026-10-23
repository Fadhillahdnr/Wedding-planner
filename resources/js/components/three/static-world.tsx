/** Ilustrasi statis (SVG buatan sendiri) saat WebGL tidak tersedia atau pengguna memilih tanpa 3D. */
export function StaticWorld() {
    return (
        <svg viewBox="0 0 400 300" role="img" aria-label="Ilustrasi lengkungan bunga di atas jalur menuju taman kecil" className="size-full">
            <ellipse cx="200" cy="248" rx="170" ry="34" className="fill-mint" />
            <ellipse cx="200" cy="258" rx="140" ry="22" className="fill-aqua" opacity="0.7" />
            <path d="M205 292 C 150 262, 250 246, 200 222" fill="none" stroke="var(--color-ivory)" strokeWidth="26" strokeLinecap="round" />
            <path d="M120 232 V110 a80 80 0 0 1 160 0 V232" fill="none" stroke="var(--color-ivory)" strokeWidth="9" strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const a = Math.PI - (i / 8) * Math.PI;
                return (
                    <circle key={i} cx={200 + Math.cos(a) * 80} cy={110 - Math.sin(a) * 80} r="9" className={i % 2 ? 'fill-blush' : 'fill-coral'} />
                );
            })}
            <path d="M200 176 c-14-10-24-18-14-28 6-6 14-2 14 4 0-6 8-10 14-4 10 10 0 18-14 28z" className="fill-coral" />
            <circle cx="70" cy="60" r="16" className="fill-ivory" />
            <circle cx="88" cy="56" r="20" className="fill-ivory" />
            <circle cx="320" cy="82" r="14" className="fill-ivory" />
            <circle cx="336" cy="78" r="18" className="fill-ivory" />
        </svg>
    );
}

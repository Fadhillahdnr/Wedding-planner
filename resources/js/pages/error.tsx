import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

const messages: Record<number, { title: string; body: string }> = {
    403: { title: 'Bagian ini bukan untukmu', body: 'Akun ini tidak punya akses ke halaman tersebut.' },
    404: { title: 'Halamannya tidak ketemu', body: 'Tautannya mungkin sudah berubah, atau memang belum pernah ada.' },
    419: { title: 'Sesinya sudah kedaluwarsa', body: 'Muat ulang halaman lalu coba lagi; isian yang belum tersimpan perlu diketik ulang.' },
    429: { title: 'Terlalu banyak percobaan', body: 'Tunggu sebentar, lalu coba lagi.' },
    500: { title: 'Ada yang salah di sisi kami', body: 'Datamu aman. Coba lagi beberapa saat lagi.' },
    503: { title: 'Sedang dirawat sebentar', body: 'Aplikasi akan kembali dalam beberapa menit.' },
};

export default function ErrorPage({ status }: { status: number }) {
    const message = messages[status] ?? messages[500];

    return (
        <div className="bg-paper text-ink flex min-h-svh flex-col justify-center px-6 py-12 sm:px-12">
            <Head title={message.title} />
            <main className="mx-auto w-full max-w-md">
                <p className="font-display num text-ink-faint text-7xl leading-none">{status}</p>
                <h1 className="mt-6 text-4xl leading-tight font-medium">{message.title}</h1>
                <p className="text-ink-soft mt-3">{message.body}</p>
                <hr className="border-line my-8" />
                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="h-12">
                        <Link href="/dashboard">Ke ringkasan</Link>
                    </Button>
                    <Button size="lg" variant="ghost" className="h-12" onClick={() => window.history.back()}>
                        Kembali
                    </Button>
                </div>
            </main>
        </div>
    );
}

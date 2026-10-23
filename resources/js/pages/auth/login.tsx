import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { TextField } from '@/components/planner/field';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{ email: string; password: string; remember: boolean }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout title="Masuk" description="Ruang rencana pernikahan kalian berdua.">
            <Head title="Masuk" />

            {status && (
                <p role="status" className="bg-sage-soft text-sage mb-6 rounded-md px-4 py-3 text-sm">
                    {status}
                </p>
            )}

            <form className="grid gap-5" onSubmit={submit}>
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={data.email}
                    error={errors.email}
                    onChange={(e) => setData('email', e.target.value)}
                />
                <TextField
                    label="Kata sandi"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={data.password}
                    error={errors.password}
                    onChange={(e) => setData('password', e.target.value)}
                />

                <label className="flex min-h-11 items-center gap-3 text-sm">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="accent-brand size-5"
                    />
                    Ingat saya di perangkat ini
                </label>

                <Button type="submit" size="lg" className="h-12" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    {processing ? 'Memeriksa…' : 'Masuk'}
                </Button>

                {canResetPassword && (
                    <TextLink href={route('password.request')} className="text-ink-soft text-sm">
                        Lupa kata sandi?
                    </TextLink>
                )}
            </form>

            <p className="text-ink-faint mt-10 text-sm">Belum punya akses? Minta tautan undangan dari pasanganmu.</p>
        </AuthLayout>
    );
}

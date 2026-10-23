import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { TextField } from '@/components/planner/field';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function AcceptInvitation({ email, token }: { email: string; token: string }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', password: '', password_confirmation: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/undangan/${token}`);
    };

    return (
        <AuthLayout title="Gabung ke rencana kalian" description={`Undangan untuk ${email}. Tautan ini hanya berlaku sekali.`}>
            <Head title="Terima undangan" />

            <form className="grid gap-5" onSubmit={submit}>
                <TextField
                    label="Nama"
                    name="name"
                    required
                    autoFocus
                    autoComplete="name"
                    value={data.name}
                    error={errors.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <TextField
                    label="Kata sandi"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    hint="Minimal 12 karakter."
                    value={data.password}
                    error={errors.password}
                    onChange={(e) => setData('password', e.target.value)}
                />
                <TextField
                    label="Ulangi kata sandi"
                    name="password_confirmation"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                />
                <Button type="submit" size="lg" className="h-12" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    {processing ? 'Menyimpan…' : 'Buat akun dan masuk'}
                </Button>
            </form>
        </AuthLayout>
    );
}

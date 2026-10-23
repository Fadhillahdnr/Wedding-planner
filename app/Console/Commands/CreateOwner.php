<?php

namespace App\Console\Commands;

use App\Enums\MemberRole;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CreateOwner extends Command
{
    protected $signature = 'app:create-owner {--name=} {--email=} {--password=}';

    protected $description = 'Membuat akun pemilik beserta workspace pernikahannya (tidak ada pendaftaran publik).';

    public function handle(): int
    {
        $data = [
            'name' => $this->option('name') ?: $this->ask('Nama'),
            'email' => $this->option('email') ?: $this->ask('Email'),
            'password' => $this->option('password') ?: $this->secret('Password (min. 12 karakter)'),
        ];

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        DB::transaction(function () use ($data) {
            $user = User::create($data);
            $user->forceFill(['email_verified_at' => now()])->save();

            $wedding = Wedding::create([]);
            WeddingMember::create(['wedding_id' => $wedding->id, 'user_id' => $user->id, 'role' => MemberRole::Owner]);
        });

        $this->info('Pemilik dibuat. Masuk lewat /login lalu selesaikan onboarding.');

        return self::SUCCESS;
    }
}

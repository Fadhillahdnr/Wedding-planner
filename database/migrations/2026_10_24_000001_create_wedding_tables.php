<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weddings', function (Blueprint $table) {
            $table->id();
            $table->string('partner_one_name')->nullable();
            $table->string('partner_two_name')->nullable();
            // Hari H disimpan sebagai date (bukan timestamp) agar tidak bergeser zona waktu.
            $table->date('target_date')->nullable();
            // Perkiraan bulan (selalu tanggal 1) dipakai selama target_date belum pasti.
            $table->date('target_month')->nullable();
            $table->string('timezone', 64)->default('Asia/Jakarta');
            $table->string('city')->nullable();
            $table->unsignedInteger('guest_estimate')->nullable();
            $table->unsignedBigInteger('total_budget')->nullable();
            $table->unsignedTinyInteger('contingency_percent')->default(6);
            $table->unsignedTinyInteger('price_buffer_percent')->default(0);
            $table->unsignedTinyInteger('warning_threshold_percent')->default(90);
            $table->boolean('include_honeymoon')->default(false);
            $table->boolean('include_prewedding')->default(false);
            $table->string('tradition')->nullable();
            $table->json('ceremonies')->nullable();
            $table->timestamp('onboarded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wedding_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            // Satu pengguna hanya tergabung di satu workspace pada versi ini.
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('role', 20);
            $table->timestamps();
        });

        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->string('email');
            // Hanya hash token yang disimpan; token asli ada di tautan undangan saja.
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
        Schema::dropIfExists('wedding_members');
        Schema::dropIfExists('weddings');
    }
};

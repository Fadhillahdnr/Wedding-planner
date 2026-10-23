<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30);
            $table->date('event_date')->nullable();
            $table->string('location')->nullable();
            $table->decimal('budget', 14, 2)->nullable();
            $table->text('message')->nullable();
            $table->string('status', 20)->default('new')->index();
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('partner_name')->nullable();
            $table->date('event_date')->nullable();
            $table->string('venue')->nullable();
            $table->string('event_type', 30)->default('wedding');
            $table->unsignedInteger('guest_estimate')->nullable();
            $table->decimal('budget_total', 14, 2)->default(0);
            $table->char('currency', 3)->default('IDR');
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->date('preferred_date');
            $table->string('status', 20)->default('pending')->index();
            $table->string('payment_status', 20)->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['package_id', 'preferred_date']);
        });

        Schema::create('booking_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->date('due_date')->nullable();
            $table->boolean('is_done')->default(false);
            $table->timestamps();
        });

        Schema::create('budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('name');
            $table->decimal('estimated', 14, 2)->default(0);
            $table->decimal('actual', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('saved_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'vendor_id']);
        });
    }

    public function down(): void
    {
        foreach (['saved_vendors', 'budget_items', 'tasks', 'booking_status_histories', 'bookings', 'events', 'consultation_leads'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};

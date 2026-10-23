<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('vendor_slot_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('belum');
            $table->string('priority', 20)->default('normal');
            $table->unsignedTinyInteger('phase')->nullable();
            // Jarak ke hari H: positif = sebelum, negatif = sesudah. Null untuk tugas buatan pengguna.
            $table->integer('offset_value')->nullable();
            $table->string('offset_unit', 10)->nullable();
            $table->boolean('date_locked')->default(false);
            $table->boolean('needs_reschedule')->default(false);
            $table->string('source', 20)->default('user');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['wedding_id', 'status', 'due_date']);
        });

        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->nullableMorphs('mediable');
            $table->string('provider', 20)->default('cloudinary');
            $table->string('public_id')->unique();
            $table->string('kind', 20);
            $table->string('resource_type', 20);
            $table->string('delivery_type', 20)->default('authenticated');
            $table->string('format', 10)->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('bytes')->default(0);
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 60);
            $table->json('context')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['wedding_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('media_assets');
        Schema::dropIfExists('tasks');
    }
};

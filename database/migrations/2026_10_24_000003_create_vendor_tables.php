<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('budget_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('need', 20)->default('needed');
            // Berapa bulan sebelum hari H idealnya vendor ini sudah dipilih.
            $table->unsignedSmallInteger('ideal_months_before')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('source', 20)->default('user');
            $table->timestamps();
        });

        Schema::create('vendor_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_slot_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('city')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('instagram')->nullable();
            $table->string('website')->nullable();
            $table->string('package_name')->nullable();
            $table->unsignedBigInteger('quoted_price')->nullable();
            $table->date('quoted_on')->nullable();
            $table->date('quote_valid_until')->nullable();
            $table->text('inclusions')->nullable();
            $table->text('exclusions')->nullable();
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->string('source')->nullable();
            $table->string('status', 20)->default('shortlist');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['wedding_id', 'vendor_slot_id', 'status']);
        });

        // Dijaga di level database: satu slot hanya boleh punya satu kandidat terpilih.
        DB::statement("create unique index vendor_candidates_one_selected_per_slot on vendor_candidates (vendor_slot_id) where status = 'terpilih'");

        Schema::create('score_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedTinyInteger('weight')->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('vendor_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('score_criterion_id')->constrained('score_criteria')->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->timestamps();

            $table->unique(['vendor_candidate_id', 'score_criterion_id']);
        });

        Schema::create('vendor_meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_candidate_id')->constrained()->cascadeOnDelete();
            $table->date('met_on');
            $table->text('notes')->nullable();
            $table->text('follow_up')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_meetings');
        Schema::dropIfExists('vendor_scores');
        Schema::dropIfExists('score_criteria');
        Schema::dropIfExists('vendor_candidates');
        Schema::dropIfExists('vendor_slots');
    }
};

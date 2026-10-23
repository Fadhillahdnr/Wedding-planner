<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedBigInteger('allocated_amount')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('source', 20)->default('user');
            $table->timestamps();

            $table->index(['wedding_id', 'sort_order']);
        });

        Schema::create('budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('budget_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('pricing_mode', 20)->default('fixed');
            $table->unsignedBigInteger('estimate_min')->nullable();
            $table->unsignedBigInteger('estimate_max')->nullable();
            $table->unsignedBigInteger('price_per_guest')->nullable();
            $table->unsignedBigInteger('agreed_amount')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('source', 20)->default('user');
            $table->timestamps();

            $table->index(['wedding_id', 'budget_category_id']);
        });

        Schema::create('funding_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedBigInteger('collected_amount')->default(0);
            $table->unsignedBigInteger('target_amount')->nullable();
            $table->unsignedBigInteger('monthly_contribution')->default(0);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('budget_item_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->unsignedBigInteger('amount');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('direncanakan');
            $table->date('paid_on')->nullable();
            $table->string('method')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['wedding_id', 'status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('funding_sources');
        Schema::dropIfExists('budget_items');
        Schema::dropIfExists('budget_categories');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 150);
            $table->text('caption')->nullable();
            $table->date('happened_on')->nullable();
            $table->timestamps();

            $table->index(['wedding_id', 'happened_on']);
        });

        Schema::create('love_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('body');
            // 'shared' = terlihat pasangan (setelah reveal_on); 'private' = hanya penulis.
            $table->string('visibility', 10)->default('shared');
            $table->date('reveal_on')->nullable();
            $table->timestamps();

            $table->index(['wedding_id', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('love_notes');
        Schema::dropIfExists('memories');
    }
};

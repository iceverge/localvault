<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('site');
            $table->text('url')->nullable();
            $table->string('username')->nullable();
            $table->string('email')->nullable();
            $table->text('password');
            $table->string('category')->default('Personal');
            $table->text('notes')->nullable();
            $table->boolean('favorite')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};

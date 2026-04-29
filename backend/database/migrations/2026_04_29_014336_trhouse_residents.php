<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trhouse_residents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained('Mhouses')->onDelete('cascade');
            $table->foreignId('resident_id')->constrained('Mresidents')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trhouse_residents');
    }
};

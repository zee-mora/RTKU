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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trhouse_resident_id')->constrained('trhouse_residents')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['Satpam', 'Kebersihan']);
            $table->integer('month');
            $table->integer('year');
            $table->enum('status', ['Lunas', 'Belum Bayar']);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

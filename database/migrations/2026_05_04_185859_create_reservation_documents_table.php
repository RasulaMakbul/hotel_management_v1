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
        Schema::create('reservation_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservation_id')->nullable();

            $table->enum('type', [
                'hospital_bill',
                'appointment',
                'medical_report',
                'other'
            ]);

            $table->string('document_number')->nullable();

            $table->string('file_path');

            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');

            $table->boolean('is_ai_verified')->default(false);
            $table->text('ai_response')->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();

            $table->foreign('reservation_id')->references('id')->on('reservations')->nullOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_documents');
    }
};
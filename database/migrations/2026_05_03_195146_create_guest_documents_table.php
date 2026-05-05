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
        Schema::create('guest_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guest_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['nid', 'passport', 'driving_license']);
            $table->string('document_number')->nullable();
            $table->string('front_image');
            $table->string('back_image')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->boolean('is_ai_verified')->default(false);
            $table->text('ai_response')->nullable();
            $table->date('expiry_date')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreign('guest_id')->references('id')->on('hotelguests')->cascadeOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_documents');
    }
};
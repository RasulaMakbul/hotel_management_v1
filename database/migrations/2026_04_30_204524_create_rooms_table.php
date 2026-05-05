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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hotel_location_id');
            $table->unsignedBigInteger('hotel_floor_id');
            $table->unsignedBigInteger('room_type_id');
            $table->string('room_number');
            $table->string('name')->nullable();
            $table->double('base_price');
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->boolean('is_active')->default(true);
            $table->string('note')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();

            $table->foreign('hotel_location_id')->references('id')->on('hotel_locations')->onDelete('cascade');
            $table->foreign('hotel_floor_id')->references('id')->on('hotel_floors')->onDelete('cascade');
            $table->foreign('room_type_id')->references('id')->on('room_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};

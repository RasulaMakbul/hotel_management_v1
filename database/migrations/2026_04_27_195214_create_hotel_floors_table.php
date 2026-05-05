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
        Schema::create('hotel_floors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hotel_location_id');
            $table->string('name');
            $table->integer('floor_number');

            $table->enum('purpose', [
                'rooms',
                'vip_rooms',
                'suites',
                'hall',
                'mixed'
            ])->default('rooms');
            $table->text('note')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('hotel_location_id')->references('id')->on('hotel_locations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_floors');
    }
};
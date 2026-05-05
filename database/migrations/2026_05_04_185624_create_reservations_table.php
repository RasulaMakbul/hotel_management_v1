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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guest_id')->nullable();

            // 🔥 Flexible booking
            $table->enum('booking_type', ['hourly', 'daily', 'weekly']);

            $table->dateTime('start_at');   // replaces check_in_date
            $table->dateTime('end_at');     // replaces check_out_date

            $table->integer('total_duration'); // hours OR days OR weeks

            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);

            $table->boolean('requires_medical')->default(false);

            $table->enum('status', [
                'draft',
                'confirmed',
                'checked_in',
                'checked_out',
                'cancelled'
            ])->default('draft');

            $table->text('note')->nullable();

            $table->foreign('guest_id')->references('id')->on('hotelguests')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
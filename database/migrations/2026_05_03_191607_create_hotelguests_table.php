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
        Schema::create('hotelguests', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('phone')->unique();
            $table->string('email')->nullable()->index();
            $table->date('date_of_birth')->nullable();

            // Optional auth link (later Google login / guest portal)
            $table->unsignedBigInteger('user_id')->nullable()->unique();

            // Identity documents (important for hotels)
            $table->string('passport_no')->nullable();
            $table->string('nid_no')->nullable();

            // Guest profiling
            $table->enum('type', ['walk_in', 'corporate', 'vip', 'regular', 'online'])->default('walk_in');
            $table->text('address')->nullable();
            $table->text('note')->nullable();

            // Stats (very useful for hotel business)
            $table->integer('total_visits')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['phone', 'email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotelguests');
    }
};
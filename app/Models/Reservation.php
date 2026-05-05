<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    protected $fillable = [
        'guest_id',
        'booking_type',
        'start_at',
        'end_at',
        'total_duration',
        'total_amount',
        'discount',
        'requires_medical',
        'status',
        'note',
    ];



    /**
     * Get the guest that owns the Reservation
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Hotelguest::class, 'guest_id', 'id');
    }

    /**
     * Get all of the reservationRoom for the Reservation
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservationRoom(): HasMany
    {
        return $this->hasMany(ReservationRoom::class, 'reservation_id', 'id');
    }

    /**
     * Get all of the reservationDocument for the Reservation
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservationDocument(): HasMany
    {
        return $this->hasMany(ReservationDocument::class, 'reservation_id', 'id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotelguest extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'date_of_birth',
        'user_id',
        'passport_no',
        'nid_no',
        'type',
        'address',
        'note',
    ];
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the user that owns the Hotelguest
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get all of the guestDocument for the Hotelguest
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function guestDocument(): HasMany
    {
        return $this->hasMany(GuestDocument::class, 'guest_id', 'id');
    }

    /**
     * Get all of the reservation for the Hotelguest
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservation(): HasMany
    {
        return $this->hasMany(Reservation::class, 'guest_id', 'id');
    }
}
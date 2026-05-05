<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestDocument extends Model
{
    protected $fillable = [
        'guest_id',
        'type',
        'document_number',
        'front_image',
        'back_image',
        'status',
        'is_ai_verified',
        'ai_response',
        'expiry_date',
        'verified_by',
        'verified_at',
    ];

    /**
     * Get the hotelGuest that owns the GuestDocument
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hotelGuest(): BelongsTo
    {
        return $this->belongsTo(Hotelguest::class, 'guest_id', 'id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationDocument extends Model
{
    protected $fillable = [
        'reservation_id',
        'type',
        'document_number',
        'file_path',
        'status',
        'is_ai_verified',
        'ai_response',
        'verified_at',
        'verified_by',
    ];

    /**
     * Get the reservation that owns the ReservationDocument
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(reservation::class, 'reservation_id', 'id');
    }

    /**
     * Get the user that verified the ReservationDocument
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by', 'id');
    }
}
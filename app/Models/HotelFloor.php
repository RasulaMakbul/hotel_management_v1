<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelFloor extends Model
{
    protected $fillable = [
        'hotel_location_id',
        'name',
        'floor_number',
        'purpose',
        'note',
        'is_active',
    ];

    /**
     * Get the hotelLocation that owns the HotelFloor
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hotelLocation(): BelongsTo
    {
        return $this->belongsTo(HotelLocation::class, 'hotel_location_id', 'id');
    }

    public const PURPOSE_ROOMS = 'rooms';
    public const PURPOSE_VIP_ROOMS = 'vip_rooms';
    public const PURPOSE_SUITES = 'suites';
    public const PURPOSE_HALL = 'hall';
    public const PURPOSE_MIXED = 'mixed';

    public static function purposeLabels(): array
    {
        return [
            self::PURPOSE_ROOMS => 'Rooms',
            self::PURPOSE_VIP_ROOMS => 'VIP Rooms',
            self::PURPOSE_SUITES => 'Suites',
            self::PURPOSE_HALL => 'Hall',
            self::PURPOSE_MIXED => 'Mixed',
        ];
    }

    public const STATUS_ACTIVE = true;
    public const STATUS_INACTIVE = false;

    /**
     * Get all of the rooms for the HotelFloor
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'hotel_floor_id', 'id');
    }
}

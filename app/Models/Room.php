<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    protected $fillable = [
        'hotel_location_id',
        'hotel_floor_id',
        'room_type_id',
        'room_number',
        'name',
        'base_price',
        'status',
        'is_active',
        'note',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_OCCUPIED = 'occupied';
    public const STATUS_MAINTENANCE = 'maintenance';

    public static function statusLabels(): array
    {
        return [
            self::STATUS_AVAILABLE => 'Available',
            self::STATUS_OCCUPIED => 'Occupied',
            self::STATUS_MAINTENANCE => 'Maintenance',
        ];
    }

    public const ISACTIVE_ACTIVE = true;
    public const ISACTIVE_INACTIVE = false;

    /**
     * Get the hotelLocation that owns the Room
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hotelLocation(): BelongsTo
    {
        return $this->belongsTo(HotelLocation::class, 'hotel_location_id', 'id');
    }

    /**
     * Get the hotelFloor that owns the Room
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hotelFloor(): BelongsTo
    {
        return $this->belongsTo(HotelFloor::class, 'hotel_floor_id', 'id');
    }

    /**
     * Get the roomType that owns the Room
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'id');
    }
}

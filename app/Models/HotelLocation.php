<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelLocation extends Model
{
    protected $fillable = [
        'name',
        'area',
        'address',
        'city',
        'hotel_type',
        'contact_number',
        'email',
        'contact_person',
        'image',
        'status',
    ];

    public const TYPE_RESORT = 'resort';
    public const TYPE_BOUTIQUE = 'boutique';
    public const TYPE_BUSINESS = 'business';
    public const TYPE_LUXURY = 'luxury';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';



    public static function hotelTypeLabels(): array
    {
        return [
            self::TYPE_RESORT => 'Resort',
            self::TYPE_BOUTIQUE => 'Boutique Hotel',
            self::TYPE_BUSINESS => 'Business Hotel',
            self::TYPE_LUXURY => 'Luxury Hotel',
        ];
    }

    public static function statusLabels(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
        ];
    }

    /**
     * Get all of the hotelFloor for the HotelLocation
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function hotelFloor(): HasMany
    {
        return $this->hasMany(HotelFloor::class, 'hotel_location_id', 'id');
    }

    /**
     * Get all of the rooms for the HotelLocation
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'hotel_location_id', 'id');
    }
}

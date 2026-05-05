<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    // use Auditable;
    protected $fillable = [
        'name',
        'base_price',
        'description',
        'image',
        'is_active',
        'capacity'
    ];

    /**
     * Get all of the room for the RoomType
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function room(): HasMany
    {
        return $this->hasMany(Room::class, 'room_type_id', 'id');
    }
}

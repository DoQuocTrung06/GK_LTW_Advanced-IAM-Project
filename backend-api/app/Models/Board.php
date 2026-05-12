<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $fillable = ['board_code', 'owner_id', 'visibility', 'board_data']; 

    protected $casts = [
        'board_data' => 'array',
    ];

   
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

   
    public function invites()
    {
        return $this->hasMany(BoardInvite::class);
    }
}
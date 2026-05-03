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

    // Mối quan hệ: Một bảng vẽ thuộc về 1 người tạo (User)
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Mối quan hệ: Một bảng vẽ có nhiều thư mời
    public function invites()
    {
        return $this->hasMany(BoardInvite::class);
    }
}
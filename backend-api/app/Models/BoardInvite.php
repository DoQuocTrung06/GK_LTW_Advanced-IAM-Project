<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardInvite extends Model
{
    use HasFactory;

    protected $fillable = ['board_id', 'email'];

    // Mối quan hệ: Thư mời này thuộc về bảng vẽ nào
    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}
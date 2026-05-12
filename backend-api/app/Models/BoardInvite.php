<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardInvite extends Model
{
    use HasFactory;

    protected $fillable = ['board_id', 'email', 'role'];
    
    public function board()
    {
        return $this->belongsTo(Board::class);
    }
}
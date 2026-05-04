<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject; // MỚI: Import JWTSubject

// MỚI: Implement JWTSubject
class User extends Authenticatable implements JWTSubject 
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp',              
        'otp_expires_at',
        'google_id',            // MỚI
        'role',                 // MỚI
        'two_factor_secret',    // MỚI
        'two_factor_enabled',   // MỚI
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',    // MỚI: Ẩn secret key đi để bảo mật
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean', // MỚI
        ];
    }

    // ==========================================
    // MỚI: 2 hàm bắt buộc của JWTSubject
    // ==========================================
    
    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        // Gắn luôn thông tin role vào token để React dễ dàng check quyền (RBAC)
        return [
            'role' => $this->role,
            'name' => $this->name
        ];
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mresidents extends Model
{
    use HasFactory;
    
    protected $table = 'Mresidents';

    protected $fillable = [
        'fullname',
        'ktp_path',
        'resident_status',
        'phone_number',
        'marital_status',
        'updated_by',
        'created_by',
    ];

    public function houses()
    {
        return $this->hasMany(Mhouse::class, 'current_resident_id');
    }

    public function occupancies()
    {
        return $this->hasMany(Trhouse_residents::class, 'resident_id');
    }
}

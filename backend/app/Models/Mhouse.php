<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mhouse extends Model
{
	protected $table = 'Mhouses';

	protected $fillable = [
		'house_number',
		'block_name',
		'occupancy_status',
		'current_resident_id',
		'notes',
	];

	public function currentResident()
	{
		return $this->belongsTo(Mresidents::class, 'current_resident_id');
	}

	public function occupancies()
	{
		return $this->hasMany(Trhouse_residents::class, 'house_id');
	}
}

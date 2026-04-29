<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Mhouse;

class HouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            Mhouse::create([
                'house_number' => 'Blok A-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'is_occupied' => false,
            ]);
        }
    }
}

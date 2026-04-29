<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Expenses_Category; 

class ExpensesCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Perbaikan Jalan', 'Listrik Pos', 'Gaji Satpam', 'Kebersihan', 'Umum'];

        foreach ($categories as $cat) {
            // Langsung panggil modelnya di sini
            Expenses_Category::create(['name' => $cat]);
        }
    }
}

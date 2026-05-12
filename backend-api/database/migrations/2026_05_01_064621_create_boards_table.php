<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('boards', function (Blueprint $table) {
            $table->id();
           
            $table->string('board_code')->unique(); 
            
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            
            $table->enum('visibility', ['public', 'private'])->default('private');
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};

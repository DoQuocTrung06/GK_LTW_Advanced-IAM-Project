<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('board_invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained('boards')->onDelete('cascade');
            $table->string('email'); 
            $table->timestamps();
            
            
            $table->unique(['board_id', 'email']);
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('board_invites');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('board_invites', function (Blueprint $table) {
            $table->enum('role', ['viewer', 'editor'])->default('viewer')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('board_invites', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
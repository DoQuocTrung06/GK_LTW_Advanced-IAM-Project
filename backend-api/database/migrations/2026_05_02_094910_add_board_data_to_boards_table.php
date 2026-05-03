<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('boards', function (Blueprint $table) {
            // Thêm cột board_data kiểu longText (để chứa mảng JSON siêu dài), cho phép null ban đầu
            $table->longText('board_data')->nullable()->after('visibility');
        });
    }

    public function down()
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->dropColumn('board_data');
        });
    }
};
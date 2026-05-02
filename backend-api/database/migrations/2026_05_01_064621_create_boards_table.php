<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('boards', function (Blueprint $table) {
            $table->id();
            // Dùng một chuỗi ngẫu nhiên (UUID/mã code) để làm link share thay vì số 1, 2, 3 cho bảo mật
            $table->string('board_code')->unique(); 
            // Liên kết với id của người tạo phòng (bảng users)
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            // Quyền truy cập
            $table->enum('visibility', ['public', 'private'])->default('private');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};

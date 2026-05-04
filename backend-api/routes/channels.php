<?php

use Illuminate\Support\Facades\Broadcast;

// Định nghĩa Presence Channel cho bảng vẽ
Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    // Chỉ cần trả về id và name. 
    // Frontend đã có hàm getUserColor(id) để lo việc hiển thị màu rồi!
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});
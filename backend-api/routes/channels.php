<?php

use Illuminate\Support\Facades\Broadcast;

// Định nghĩa Presence Channel cho bảng vẽ (Lưu ý: Kênh Presence bắt buộc phải có chữ 'presence-' ở đầu)
Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    // Nếu user hợp lệ (có token), trả về cục data để người khác nhìn thấy
    $colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    
    return [
        'id' => $user->id,
        'name' => $user->name,
        'color' => $colors[$user->id % count($colors)] // Cấp ngẫu nhiên 1 màu cố định cho user này
    ];
});

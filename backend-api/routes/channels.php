<?php
use Illuminate\Support\Facades\Broadcast;

// THÊM ĐOẠN ['guards' => ['api']] VÀO CUỐI NHƯ THẾ NÀY:
Broadcast::channel('board.{id}', function ($user, $id) {
    // Logic của bạn, ví dụ trả về thông tin user để hiển thị con trỏ chuột
    return [
        'id' => $user->id,
        'name' => $user->name
    ];
}, ['guards' => ['api']]); // <--- CHÌA KHÓA NẰM Ở ĐÂY
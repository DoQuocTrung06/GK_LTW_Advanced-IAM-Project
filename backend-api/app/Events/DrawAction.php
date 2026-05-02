<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Quan trọng: Phát sóng ngay lập tức
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DrawAction implements ShouldBroadcastNow 
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;    // ID của bảng
    public $actionData; // Dữ liệu nét vẽ (toạ độ x, y, màu sắc...)

    public function __construct($boardId, $actionData)
    {
        $this->boardId = $boardId;
        $this->actionData = $actionData;
    }

    public function broadcastOn(): array
    {
        // CHỈ ĐỂ TÊN LÀ 'board.', Laravel sẽ tự động thêm 'presence-' thành 'presence-board.'
        return [
            new \Illuminate\Broadcasting\PresenceChannel('board.' . $this->boardId),
        ];
    }

    public function broadcastAs(): string
    {
        // Tên sự kiện để React nhận diện (có dấu chấm ở đầu khi listen bên React)
        return 'draw.action';
    }
}
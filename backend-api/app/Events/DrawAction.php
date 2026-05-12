<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; 
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DrawAction implements ShouldBroadcastNow 
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;    
    public $actionData; 

    public function __construct($boardId, $actionData)
    {
        $this->boardId = $boardId;
        $this->actionData = $actionData;
    }

    public function broadcastOn(): array
    {
        
        return [
            new \Illuminate\Broadcasting\PresenceChannel('board.' . $this->boardId),
        ];
    }

    public function broadcastAs(): string
    {
        
        return 'draw.action';
    }
}
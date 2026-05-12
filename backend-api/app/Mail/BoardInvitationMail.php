<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Board;

class BoardInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $board;
    public $inviteLink;
    public $role; 

   
    public function __construct(Board $board, $role = 'viewer')
    {
        $this->board = $board;
        $this->role = $role; 
        
        
        $baseUrl = config('app.frontend_url');
        $this->inviteLink = rtrim($baseUrl, '/') . "/board/" . ($board->board_code ?? $board->id);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You are invited to a Magic Whiteboard!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.board_invite', 
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
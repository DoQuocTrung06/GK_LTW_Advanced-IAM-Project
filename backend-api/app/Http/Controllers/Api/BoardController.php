<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\BoardInvite;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\BoardInvitationMail;

class BoardController extends Controller
{
    
    public function invite(Request $request, string $boardId)
    {
        $board = Board::findOrFail($boardId);

       
        if ($board->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can invite people.'], 403);
        }

        
        $request->validate([
            'email' => 'required|email',
            'role'  => 'sometimes|in:viewer,editor' 
        ]);

        if ($request->email === $request->user()->email) {
            return response()->json(['message' => 'You cannot invite yourself.'], 400);
        }

        
        $invite = BoardInvite::updateOrCreate(
            ['board_id' => $board->id, 'email' => $request->email],
            ['role' => $request->role ?? 'viewer'] 
        );

        
        $roleToSend = $request->role ?? 'viewer';

        
        Mail::to($request->email)->send(new BoardInvitationMail($board, $roleToSend));
        
        return response()->json([
            'message' => 'Invited successfully!',
            'invite' => $invite
        ]);
    }

    
    public function updateVisibility(Request $request, string $boardId)
    {
        $board = Board::findOrFail($boardId);

       
        if ($board->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can change visibility.'], 403);
        }

        $request->validate([
            'visibility' => 'required|in:public,private'
        ]);

        $board->visibility = $request->visibility;
        $board->save();

        return response()->json([
            'message' => 'Visibility updated successfully!',
            'visibility' => $board->visibility
        ]);
    }

   
    public function getOrCreateBoard(Request $request, $id = null)
    {
        if ($id && $id !== 'new') {
            $board = Board::where('id', $id)->orWhere('board_code', $id)->firstOrFail();
            $user = auth('api')->user();

            $userRole = 'viewer'; 

            
            if ($user && $user->id === $board->owner_id) {
                $userRole = 'owner';
            } else {
                
                $invite = null;
                if ($user) {
                    $invite = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->first();
                }

                if ($invite) {
                    
                    $userRole = $invite->role ?? 'viewer'; 
                } elseif ($board->visibility === 'public') {
                    
                    $userRole = 'editor'; 
                } else {
                    
                    return response()->json(['message' => 'You do not have permission to view this board.'], 403);
                }
            }

            
            $board->role = $userRole;

            return response()->json($board);
        }

        
        $board = Board::create([
            'board_code' => (string) Str::uuid(),
            'owner_id' => $request->user()->id,
            'visibility' => 'private'
        ]);

        
        $board->role = 'owner';

        return response()->json($board);
    }

    
    public function broadcastDraw(Request $request, $boardId)
    {
        $request->validate(['actionData' => 'required']);
        broadcast(new \App\Events\DrawAction($boardId, $request->actionData));
        return response()->json(['status' => 'success']);
    }

    
    public function saveBoardData(Request $request, $boardId)
    {
        $request->validate(['board_data' => 'required']);
        $board = Board::findOrFail($boardId);

        $user = $request->user();

        
        $isOwner = $user->id === $board->owner_id;

        
        $invite = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->first();
        
        
        $canEdit = $isOwner || ($invite && $invite->role === 'editor');
        
        
        if (!$canEdit) {
             return response()->json(['message' => 'Unauthorized to save data. You are just a viewer.'], 403);
        }

        
        $board->board_data = $request->board_data;
        $board->save();

        return response()->json(['message' => 'Board saved successfully!']);
    }
}
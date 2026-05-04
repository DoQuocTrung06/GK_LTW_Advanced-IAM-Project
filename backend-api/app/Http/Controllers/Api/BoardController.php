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
    // Hàm 1: Mời một email vào bảng vẽ
    public function invite(Request $request, string $boardId)
    {
        $board = Board::findOrFail($boardId);

        // SECURITY: Chỉ chủ bảng (Owner) mới có quyền mời
        if ($board->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can invite people.'], 403);
        }

        $request->validate([
            'email' => 'required|email'
        ]);

        if ($request->email === $request->user()->email) {
            return response()->json(['message' => 'You cannot invite yourself.'], 400);
        }

        $invite = BoardInvite::firstOrCreate([
            'board_id' => $board->id,
            'email' => $request->email
        ]);

        // TODO: GỌI HÀM GỬI MAIL Ở ĐÂY (Sẽ làm ở bước sau)
        Mail::to($request->email)->send(new BoardInvitationMail($board));
        return response()->json([
            'message' => 'Invited successfully!',
            'invite' => $invite
        ]);
    }

    // Hàm 2: Cập nhật quyền Public/Private
    public function updateVisibility(Request $request, string $boardId)
    {
        $board = Board::findOrFail($boardId);

        // SECURITY: Chỉ chủ bảng mới được đổi quyền
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

    // Hàm 3: Lấy dữ liệu bảng (NGƯỜI GÁC CỔNG)
    public function getOrCreateBoard(Request $request, $id = null)
    {
        if ($id && $id !== 'new') {
            $board = Board::where('id', $id)->orWhere('board_code', $id)->firstOrFail();

            // Nếu Private thì bắt đầu xét duyệt
            if ($board->visibility === 'private') {
                // SỬA sanctum THÀNH api
                $user = auth('api')->user(); 

                if (!$user) {
                    return response()->json(['message' => 'Please login to access this private board.'], 401);
                }

                $isOwner = $user->id === $board->owner_id;
                $isInvited = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->exists();

                if (!$isOwner && !$isInvited) {
                    return response()->json(['message' => 'You do not have permission to view this board.'], 403);
                }
            }

            return response()->json($board);
        }

        // Tạo phòng mới
        $board = Board::create([
            'board_code' => (string) Str::uuid(),
            'owner_id' => $request->user()->id,
            'visibility' => 'private'
        ]);

        return response()->json($board);
    }

    // Hàm 4: Phát sóng nét vẽ
    public function broadcastDraw(Request $request, $boardId)
    {
        $request->validate(['actionData' => 'required']);
        broadcast(new \App\Events\DrawAction($boardId, $request->actionData));
        return response()->json(['status' => 'success']);
    }

    // Hàm 5: Lưu dữ liệu (Auto-save)
    public function saveBoardData(Request $request, $boardId)
    {
        $request->validate(['board_data' => 'required']);
        $board = Board::findOrFail($boardId);

        // BẢO MẬT: Phải có quyền mới được lưu đè nét vẽ
        $user = $request->user();
        $isOwner = $user->id === $board->owner_id;
        $isInvited = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->exists();
        
        if ($board->visibility === 'private' && !$isOwner && !$isInvited) {
             return response()->json(['message' => 'Unauthorized to save data.'], 403);
        }

        $board->board_data = $request->board_data;
        $board->save();

        return response()->json(['message' => 'Board saved successfully!']);
    }
}
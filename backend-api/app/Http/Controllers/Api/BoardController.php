<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\BoardInvite;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str; // THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI STR

class BoardController extends Controller
{
    // Hàm 1: Mời một email vào bảng vẽ
    public function invite(Request $request, string $boardId)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // Lưu email vào database
        $invite = BoardInvite::firstOrCreate([
            'board_id' => $boardId,
            'email' => $request->email
        ]);

        return response()->json([
            'message' => 'Invited successfully!',
            'invite' => $invite
        ]);
    }

    // Hàm 2: Cập nhật quyền Public/Private
    public function updateVisibility(Request $request, string $boardId)
    {
        $request->validate([
            'visibility' => 'required|in:public,private'
        ]);

        $board = Board::findOrFail($boardId);
        $board->visibility = $request->visibility;
        $board->save();

        return response()->json([
            'message' => 'Visibility updated successfully!',
            'visibility' => $board->visibility
        ]);
    }

    // Hàm 3: Lấy hoặc tạo phòng mới
    public function getOrCreateBoard(Request $request, $id = null)
    {
        // Nếu có ID, tìm phòng đó theo id hoặc board_code
        if ($id && $id !== 'new') {
            $board = Board::where('id', $id) // Tìm theo ID số
                          ->orWhere('board_code', $id) // Hoặc tìm theo mã UUID
                          ->firstOrFail();
            return response()->json($board);
        }

        // Tạo phòng mới (giữ nguyên đoạn cũ của bạn)
        $board = Board::create([
            'board_code' => (string) \Illuminate\Support\Str::uuid(),
            'owner_id' => $request->user()->id,
            'visibility' => 'private'
        ]);

        return response()->json($board);
    }
    // --- PHẦN MỚI THÊM VÀO DƯỚI ĐÂY ---

    // Hàm 4: Nhận nét vẽ từ người này và phát sóng cho người khác
    public function broadcastDraw(Request $request, $boardId)
    {
        // Kiểm tra xem dữ liệu nét vẽ có được gửi lên không
        $request->validate([
            'actionData' => 'required'
        ]);

        // Kích hoạt Event DrawAction mà bạn vừa viết
        // Truyền ID bảng và Dữ liệu nét vẽ vào
        broadcast(new \App\Events\DrawAction($boardId, $request->actionData));

        return response()->json(['status' => 'success']);
    }
}
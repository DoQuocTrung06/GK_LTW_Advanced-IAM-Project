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

        // BỔ SUNG: Validate thêm trường role (người dùng gửi lên là viewer hay editor)
        $request->validate([
            'email' => 'required|email',
            'role'  => 'sometimes|in:viewer,editor' 
        ]);

        if ($request->email === $request->user()->email) {
            return response()->json(['message' => 'You cannot invite yourself.'], 400);
        }

        // SỬ DỤNG updateOrCreate để nếu mời lại người cũ thì nó sẽ cập nhật quyền mới cho họ
        $invite = BoardInvite::updateOrCreate(
            ['board_id' => $board->id, 'email' => $request->email],
            ['role' => $request->role ?? 'viewer'] // Mặc định là viewer nếu frontend không gửi
        );

        // TODO: GỌI HÀM GỬI MAIL Ở ĐÂY (Sẽ làm ở bước sau)
        $roleToSend = $request->role ?? 'viewer';

        // Gửi email, truyền theo cả $board và cái quyền ($roleToSend)
        Mail::to($request->email)->send(new BoardInvitationMail($board, $roleToSend));
        
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
            $user = auth('api')->user();

            $userRole = 'viewer'; // Mặc định ai vào cũng chỉ là viewer

            // 1. Nếu là chủ phòng
            if ($user && $user->id === $board->owner_id) {
                $userRole = 'owner';
            } else {
                // 2. Kiểm tra xem người này có nằm trong danh sách khách mời không
                $invite = null;
                if ($user) {
                    $invite = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->first();
                }

                if ($invite) {
                    // Nếu được mời, lấy quyền từ database (viewer hoặc editor)
                    $userRole = $invite->role ?? 'viewer'; 
                } elseif ($board->visibility === 'public') {
                    // Nếu phòng public mà không được mời, cho phép vào xem (chỉ xem, không vẽ)
                    $userRole = 'viewer'; 
                } else {
                    // Phòng private và không được mời -> Đuổi ra
                    return response()->json(['message' => 'You do not have permission to view this board.'], 403);
                }
            }

            // Gắn cái "thẻ quyền lực" này vào dữ liệu trả về cho Frontend
            $board->role = $userRole;

            return response()->json($board);
        }

        // Tạo phòng mới
        $board = Board::create([
            'board_code' => (string) Str::uuid(),
            'owner_id' => $request->user()->id,
            'visibility' => 'private'
        ]);

        // Người tạo phòng dĩ nhiên là owner
        $board->role = 'owner';

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

        $user = $request->user();

        // 1. Kiểm tra xem có phải chủ phòng không?
        $isOwner = $user->id === $board->owner_id;

        // 2. Tìm trong danh sách khách mời xem người này là ai, quyền gì?
        // (Sửa exists() thành first() để lấy data ra kiểm tra)
        $invite = BoardInvite::where('board_id', $board->id)->where('email', $user->email)->first();
        
        // 3. LOGIC PHÂN QUYỀN MỚI NẰM Ở ĐÂY:
        // Người dùng được phép SỬA (LƯU) khi: BẠN LÀ CHỦ PHÒNG (isOwner) HOẶC BẠN LÀ EDITOR
        $canEdit = $isOwner || ($invite && $invite->role === 'editor');
        
        // Nếu không có quyền Edit (tức là khách lạ, hoặc chỉ là viewer) thì chặn lại
        if (!$canEdit) {
             return response()->json(['message' => 'Unauthorized to save data. You are just a viewer.'], 403);
        }

        // Nếu vượt qua được trạm kiểm soát trên thì cho phép lưu data
        $board->board_data = $request->board_data;
        $board->save();

        return response()->json(['message' => 'Board saved successfully!']);
    }
}
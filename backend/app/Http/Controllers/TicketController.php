<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\AuditLog;

class TicketController extends Controller {
    public function getDepartments() {
        $depts = Department::all();
        if ($depts->isEmpty()) {
            Department::insert([
                ['name' => 'پشتیبانی فنی و سامانه', 'description' => 'پاسخگویی به مشکلات عملکردی و فنی نرم‌افزار', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'واحد فروش و تمدید اشتراک', 'description' => 'مشاوره خرید، ارتقا پلن‌ها و فاکتورها', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'امور مالی و حسابداری', 'description' => 'پیگیری تراکنش‌ها، صورت‌حساب‌ها و واریزها', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'مدیریت و شکایات', 'description' => 'ارتباط مستقیم با مدیریت سامانه کارویتا', 'created_at' => now(), 'updated_at' => now()],
            ]);
            $depts = Department::all();
        }
        return response()->json(['data' => $depts]);
    }

    public function index(Request $request) {
        $user = $request->user();
        $tickets = Ticket::with(['department', 'messages'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();
        return response()->json(['data' => $tickets]);
    }

    public function store(Request $request) {
        $user = $request->user();
        $subject = trim($request->input('subject', ''));
        $message = trim($request->input('message', ''));
        $departmentId = $request->input('department_id');
        $serviceName = $request->input('service_name');
        $priority = $request->input('priority', 'medium');

        if (!$subject || !$message) {
            return response()->json(['error' => 'موضوع و متن پیام تیکت الزامی هستند'], 400);
        }

        $ticket = Ticket::create([
            'user_id' => $user->id,
            'department_id' => $departmentId,
            'subject' => $subject,
            'service_name' => $serviceName,
            'priority' => $priority,
            'status' => 'pending',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $message,
            'is_admin' => false,
            'attachments' => $request->input('attachments', []),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action_type' => 'TICKET_CREATED',
            'action_description' => "ثبت تیکت جدید شماره #{$ticket->id} با موضوع: {$ticket->subject}",
            'resource_type' => 'ticket',
            'resource_id' => (string) $ticket->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'SUCCESS',
        ]);

        return response()->json(['data' => $ticket->load(['department', 'messages']), 'message' => 'تیکت شما با موفقیت ثبت شد']);
    }

    public function show(Request $request, $id) {
        $user = $request->user();
        $ticket = Ticket::with(['department', 'messages.user'])
            ->where('id', $id)
            ->when($user->role !== 'admin', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->firstOrFail();

        return response()->json(['data' => $ticket]);
    }

    public function reply(Request $request, $id) {
        $user = $request->user();
        $messageText = trim($request->input('message', ''));

        if (!$messageText) {
            return response()->json(['error' => 'متن پیام الزامی است'], 400);
        }

        $ticket = Ticket::where('id', $id)
            ->when($user->role !== 'admin', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->firstOrFail();

        $isAdmin = ($user->role === 'admin');

        $msg = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $messageText,
            'is_admin' => $isAdmin,
            'attachments' => $request->input('attachments', []),
        ]);

        $ticket->status = $isAdmin ? 'answered' : 'customer_response';
        $ticket->save();

        return response()->json(['data' => $msg, 'message' => 'پاسخ شما ارسال شد']);
    }

    public function close(Request $request, $id) {
        $user = $request->user();
        $ticket = Ticket::where('id', $id)
            ->when($user->role !== 'admin', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->firstOrFail();

        $ticket->status = 'closed';
        $ticket->save();

        return response()->json(['message' => 'تیکت بسته شد']);
    }
}

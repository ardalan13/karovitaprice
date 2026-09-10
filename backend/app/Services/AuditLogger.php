<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log user role change
     */
    public static function logUserRoleChange($user, $oldRole, $newRole, $admin)
    {
        return AuditLog::create([
            'user_id' => $admin->id,
            'action_type' => 'USER_ROLE_CHANGED',
            'action_description' => "تغییر نقش کاربر {$user->mobile} از {$oldRole} به {$newRole}",
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'SUCCESS',
            'details' => [
                'target_user_id' => $user->id,
                'old_role' => $oldRole,
                'new_role' => $newRole,
            ],
        ]);
    }

    /**
     * Log user status change
     */
    public static function logUserStatusChange($user, $oldStatus, $newStatus, $admin)
    {
        return AuditLog::create([
            'user_id' => $admin->id,
            'action_type' => 'USER_STATUS_CHANGED',
            'action_description' => "تغییر وضعیت کاربر {$user->mobile} از {$oldStatus} به {$newStatus}",
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'SUCCESS',
            'details' => [
                'target_user_id' => $user->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
        ]);
    }

    /**
     * Log ticket admin action
     */
    public static function logTicketAdminAction($ticketId, $description, $details = [], $admin = null)
    {
        $admin = $admin ?: auth()->user();

        return AuditLog::create([
            'user_id' => $admin?->id,
            'action_type' => 'TICKET_ADMIN_ACTION',
            'action_description' => $description,
            'resource_type' => 'ticket',
            'resource_id' => (string) $ticketId,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'SUCCESS',
            'details' => $details,
        ]);
    }

    /**
     * Log generic admin action
     */
    public static function logAdminAction($actionType, $description, $details = [], $admin = null)
    {
        $admin = $admin ?: auth()->user();

        return AuditLog::create([
            'user_id' => $admin?->id,
            'action_type' => $actionType,
            'action_description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'SUCCESS',
            'details' => $details,
        ]);
    }
}

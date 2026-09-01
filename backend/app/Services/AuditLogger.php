<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditLogger {
    /**
     * Log a sensitive administrative or security action.
     *
     * @param string $actionType Unique identifier for the action (e.g. 'USER_ROLE_CHANGED', 'PRICING_MODIFIED')
     * @param string $description Human-readable Persian/English description
     * @param array $options Additional metadata:
     *                      - user: User model or user ID who performed the action (defaults to authenticated user)
     *                      - resource_type: string (e.g. 'user', 'pricing_module', 'ticket', 'subscription')
     *                      - resource_id: string|int target ID
     *                      - old_values: array of previous attributes
     *                      - new_values: array of new attributes
     *                      - status: 'SUCCESS' | 'FAILED' | 'WARNING'
     *                      - details: additional context array
     *                      - request: Request instance (to extract IP & user-agent)
     * @return AuditLog|null
     */
    public static function log(string $actionType, string $description, array $options = []): ?AuditLog {
        try {
            $request = $options['request'] ?? request();
            $actor = $options['user'] ?? ($request ? $request->user() : null);
            $userId = ($actor instanceof User) ? $actor->id : ($actor ?: null);

            // Compute changes/diff if old and new values are provided
            $details = $options['details'] ?? [];
            if (isset($options['old_values']) || isset($options['new_values'])) {
                $details['diff'] = [
                    'before' => self::sanitizeSensitiveFields($options['old_values'] ?? []),
                    'after' => self::sanitizeSensitiveFields($options['new_values'] ?? []),
                ];
            }

            $ip = $options['ip_address'] ?? ($request ? $request->ip() : null);
            $userAgent = $options['user_agent'] ?? ($request ? $request->userAgent() : null);

            $audit = AuditLog::create([
                'user_id' => $userId,
                'action_type' => strtoupper($actionType),
                'action_description' => $description,
                'resource_type' => $options['resource_type'] ?? null,
                'resource_id' => isset($options['resource_id']) ? (string) $options['resource_id'] : null,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'status' => $options['status'] ?? 'SUCCESS',
                'details' => !empty($details) ? $details : null,
            ]);

            return $audit;
        } catch (\Throwable $e) {
            // Never break application flow if logging fails, but log to system log
            Log::error('Failed to write audit log: ' . $e->getMessage(), [
                'action' => $actionType,
                'exception' => $e,
            ]);
            return null;
        }
    }

    /**
     * Helper to log user role change.
     */
    public static function logUserRoleChange(User $targetUser, string $oldRole, string $newRole, ?User $admin = null): ?AuditLog {
        return self::log(
            'USER_ROLE_UPDATED',
            "تغییر نقش کاربر {$targetUser->name} ({$targetUser->mobile}) از '{$oldRole}' به '{$newRole}'",
            [
                'user' => $admin,
                'resource_type' => 'user',
                'resource_id' => $targetUser->id,
                'old_values' => ['role' => $oldRole],
                'new_values' => ['role' => $newRole],
            ]
        );
    }

    /**
     * Helper to log user status change (suspend/activate).
     */
    public static function logUserStatusChange(User $targetUser, string $oldStatus, string $newStatus, ?User $admin = null): ?AuditLog {
        $actionName = ($newStatus === 'suspended') ? 'مسدودسازی' : 'فعال‌سازی مجدد';
        return self::log(
            'USER_STATUS_UPDATED',
            "{$actionName} کاربر {$targetUser->name} ({$targetUser->mobile}) - وضعیت قبلی: '{$oldStatus}'، وضعیت جدید: '{$newStatus}'",
            [
                'user' => $admin,
                'resource_type' => 'user',
                'resource_id' => $targetUser->id,
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $newStatus],
            ]
        );
    }

    /**
     * Helper to log pricing changes.
     */
    public static function logPricingChange(array $oldModules, array $newModules, ?User $admin = null): ?AuditLog {
        return self::log(
            'PRICING_UPDATED',
            'به‌روزرسانی و تغییر تعرفه ماژول‌های ERP سازمانی توسط مدیر',
            [
                'user' => $admin,
                'resource_type' => 'pricing_module',
                'old_values' => $oldModules,
                'new_values' => $newModules,
            ]
        );
    }

    /**
     * Helper to log ticket admin intervention or status changes.
     */
    public static function logTicketAdminAction(int $ticketId, string $actionName, array $extra = [], ?User $admin = null): ?AuditLog {
        return self::log(
            'TICKET_ADMIN_ACTION',
            "اقدام مدیریتی روی تیکت #{$ticketId}: {$actionName}",
            array_merge([
                'user' => $admin,
                'resource_type' => 'ticket',
                'resource_id' => $ticketId,
            ], $extra)
        );
    }

    /**
     * Strip sensitive keys from logged payloads (passwords, tokens, verification codes).
     */
    private static function sanitizeSensitiveFields(array $data): array {
        $sensitiveKeys = ['password', 'token', 'code', 'secret', 'api_key', 'authorization', 'credit_card'];
        
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (in_array(strtolower((string)$key), $sensitiveKeys, true)) {
                $sanitized[$key] = '********';
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitizeSensitiveFields($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }
}

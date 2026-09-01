<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_users_role');
            $table->index('status', 'idx_users_status');
            $table->index('email', 'idx_users_email');
            $table->index('created_at', 'idx_users_created_at');
            $table->index(['role', 'status'], 'idx_users_role_status');
        });

        // 2. Tickets table indexes
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('status', 'idx_tickets_status');
            $table->index('priority', 'idx_tickets_priority');
            $table->index('created_at', 'idx_tickets_created_at');
            $table->index(['user_id', 'status'], 'idx_tickets_user_status');
            $table->index(['status', 'created_at'], 'idx_tickets_status_created');
            $table->index(['department_id', 'status'], 'idx_tickets_dept_status');
        });

        // 3. Ticket Messages index
        Schema::table('ticket_messages', function (Blueprint $table) {
            $table->index(['ticket_id', 'created_at'], 'idx_ticket_msgs_ticket_created');
        });

        // 4. Orders (Payment) table indexes
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status', 'idx_orders_status');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['user_id', 'status'], 'idx_orders_user_status');
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
        });

        // 5. Transactions (Payment) table indexes
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('tracking_code', 'idx_transactions_tracking_code');
            $table->index('status', 'idx_transactions_status');
            $table->index('gateway', 'idx_transactions_gateway');
            $table->index('created_at', 'idx_transactions_created_at');
            $table->index(['status', 'created_at'], 'idx_transactions_status_created');
            $table->index(['user_id', 'status'], 'idx_transactions_user_status');
        });

        // 6. Subscriptions table indexes
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('status', 'idx_subscriptions_status');
            $table->index('expires_at', 'idx_subscriptions_expires_at');
            $table->index('source', 'idx_subscriptions_source');
            $table->index(['user_id', 'status', 'expires_at'], 'idx_subscriptions_user_status_exp');
        });

        // 7. Audit Logs table indexes
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('action_type', 'idx_audit_action_type');
            $table->index('created_at', 'idx_audit_created_at');
            $table->index(['action_type', 'created_at'], 'idx_audit_action_created');
            $table->index(['resource_type', 'resource_id'], 'idx_audit_resource');
        });
    }

    public function down(): void {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_action_type');
            $table->dropIndex('idx_audit_created_at');
            $table->dropIndex('idx_audit_action_created');
            $table->dropIndex('idx_audit_resource');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('idx_subscriptions_status');
            $table->dropIndex('idx_subscriptions_expires_at');
            $table->dropIndex('idx_subscriptions_source');
            $table->dropIndex('idx_subscriptions_user_status_exp');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_tracking_code');
            $table->dropIndex('idx_transactions_status');
            $table->dropIndex('idx_transactions_gateway');
            $table->dropIndex('idx_transactions_created_at');
            $table->dropIndex('idx_transactions_status_created');
            $table->dropIndex('idx_transactions_user_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_user_status');
            $table->dropIndex('idx_orders_status_created');
        });

        Schema::table('ticket_messages', function (Blueprint $table) {
            $table->dropIndex('idx_ticket_msgs_ticket_created');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('idx_tickets_status');
            $table->dropIndex('idx_tickets_priority');
            $table->dropIndex('idx_tickets_created_at');
            $table->dropIndex('idx_tickets_user_status');
            $table->dropIndex('idx_tickets_status_created');
            $table->dropIndex('idx_tickets_dept_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_status');
            $table->dropIndex('idx_users_email');
            $table->dropIndex('idx_users_created_at');
            $table->dropIndex('idx_users_role_status');
        });
    }
};

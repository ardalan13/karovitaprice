<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Fix subscriptions.order_id foreign key
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add foreign key constraint if not exists
            $table->foreign('order_id')
                  ->references('id')
                  ->on('orders')
                  ->nullOnDelete();
        });

        // 2. CRITICAL: Add index on auth_tokens.token (used on every authenticated request)
        Schema::table('auth_tokens', function (Blueprint $table) {
            $table->index('token', 'idx_auth_tokens_token');
            $table->index(['user_id', 'expires_at'], 'idx_auth_tokens_user_expires');
        });

        // 3. Add indexes on otp_codes for verification queries
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->index(['mobile', 'status', 'expires_at'], 'idx_otp_mobile_status_exp');
            $table->index(['mobile', 'code', 'status'], 'idx_otp_verification');
        });

        // 4. Add index on companies.user_id
        Schema::table('companies', function (Blueprint $table) {
            $table->index('user_id', 'idx_companies_user_id');
        });
    }

    public function down(): void {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex('idx_companies_user_id');
        });

        Schema::table('otp_codes', function (Blueprint $table) {
            $table->dropIndex('idx_otp_mobile_status_exp');
            $table->dropIndex('idx_otp_verification');
        });

        Schema::table('auth_tokens', function (Blueprint $table) {
            $table->dropIndex('idx_auth_tokens_token');
            $table->dropIndex('idx_auth_tokens_user_expires');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
        });
    }
};

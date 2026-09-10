<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('first_name')->nullable()->default('');
            $table->string('last_name')->nullable()->default('');
            $table->string('mobile', 15)->unique();
            $table->string('role', 20)->default('user'); // admin | user
            $table->string('status', 20)->default('active'); // active | suspended
            $table->string('job_title')->nullable()->default('');
            $table->string('avatar')->nullable();
            $table->string('email')->nullable();
            $table->unsignedInteger('onboarding_step')->default(1);
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        // 2. Companies
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('subdomain', 100)->nullable();
            $table->string('economic_code', 50)->nullable();
            $table->string('national_id', 20)->nullable();
            $table->string('registration_num', 50)->nullable();
            $table->string('registration_number', 50)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // 3. OTP Codes
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('mobile', 15);
            $table->string('code', 10);
            $table->string('purpose', 20)->default('login');
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 4. Personal Access Auth Tokens
        Schema::create('auth_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('token', 128)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 5. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('order_number', 50)->unique();
            $table->bigInteger('amount')->default(0);
            $table->bigInteger('subtotal')->default(0);
            $table->bigInteger('final_amount')->default(0);
            $table->string('status', 20)->default('pending'); // pending | successful | failed
            $table->boolean('is_paid')->default(false);
            $table->string('tracking_code', 100)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('coupon_code', 50)->nullable();
            $table->bigInteger('discount_amount')->default(0);
            $table->text('description')->nullable();
            $table->json('module_ids')->nullable();
            $table->unsignedInteger('user_count')->default(5);
            $table->string('billing_period', 20)->default('monthly');
            $table->string('package_name')->nullable();
            $table->timestamps();
        });

        // 6. Transactions
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->bigInteger('amount');
            $table->string('tracking_code', 50)->nullable();
            $table->string('gateway', 30)->default('zarinpal');
            $table->string('status', 20)->default('pending'); // successful | failed
            $table->timestamps();
        });

        // 7. Subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('title')->nullable();
            $table->string('package_name')->nullable();
            $table->string('plan_name')->nullable();
            $table->string('source', 30)->default('purchase'); // trial | purchase | admin
            $table->string('status', 20)->default('active'); // active | expired | cancelled
            $table->string('billing_period', 50)->default('monthly');
            $table->unsignedInteger('user_count')->default(1);
            $table->unsignedInteger('user_limit')->default(1);
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->string('order_number', 100)->nullable();
            $table->string('server_instance')->nullable();
            $table->json('module_ids')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 8. Departments & Tickets
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('subject');
            $table->string('service_name')->nullable();
            $table->string('priority', 20)->default('medium'); // low | medium | high | emergency
            $table->string('status', 20)->default('pending'); // pending | answered | customer_response | closed
            $table->timestamps();
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->boolean('is_admin')->default(false);
            $table->json('attachments')->nullable();
            $table->timestamps();
        });

        // 9. Pricing Modules
        Schema::create('pricing_modules', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('category', 50)->default('general');
            $table->bigInteger('price')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 10. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type');
            $table->text('action_description');
            $table->string('resource_type')->nullable();
            $table->string('resource_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('status', 20)->default('SUCCESS');
            $table->json('details')->nullable();
            $table->timestamps();
        });

        // 11. Gateway Settings
        Schema::create('gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->string('zibal_merchant')->default('zibal');
            $table->boolean('zibal_sandbox')->default(false);
            $table->boolean('zibal_enabled')->default(true);
            $table->string('sms_provider')->default('sms_ir');
            $table->string('sms_api_key')->default('ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z');
            $table->string('sms_line_number')->default('30007732');
            $table->string('sms_template_otp')->default('418155');
            $table->string('sms_param_name')->default('CODE');
            $table->json('sms_templates_json')->nullable();
            $table->boolean('sms_sandbox')->default(false);
            $table->boolean('sms_enabled')->default(true);
            $table->timestamps();
        });

        // 12. SMS Logs
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->string('mobile', 20);
            $table->text('message');
            $table->string('template_id')->nullable();
            $table->string('status', 50)->default('sent');
            $table->text('response_data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('gateway_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('pricing_modules');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('auth_tokens');
        Schema::dropIfExists('otp_codes');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('users');
    }
};

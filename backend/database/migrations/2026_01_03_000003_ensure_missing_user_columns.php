<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Ensures all essential user and enterprise schema columns exist in existing production databases,
     * resolving SQLSTATE[42S22] (Column not found: 1054 Unknown column 'first_name') errors.
     */
    public function up(): void {
        // 1. Users Table missing columns
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'first_name')) {
                    $table->string('first_name')->nullable()->default('')->after('name');
                }
                if (!Schema::hasColumn('users', 'last_name')) {
                    $table->string('last_name')->nullable()->default('')->after('first_name');
                }
                if (!Schema::hasColumn('users', 'job_title')) {
                    $table->string('job_title')->nullable()->default('')->after('status');
                }
                if (!Schema::hasColumn('users', 'onboarding_step')) {
                    $table->unsignedInteger('onboarding_step')->default(1)->after('email');
                }
                if (!Schema::hasColumn('users', 'onboarding_completed_at')) {
                    $table->timestamp('onboarding_completed_at')->nullable()->after('onboarding_step');
                }
                if (!Schema::hasColumn('users', 'last_login_at')) {
                    $table->timestamp('last_login_at')->nullable()->after('onboarding_completed_at');
                }
            });
        }

        // 2. Companies Table missing columns
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (!Schema::hasColumn('companies', 'company_name')) {
                    $table->string('company_name')->nullable()->after('name');
                }
                if (!Schema::hasColumn('companies', 'subdomain')) {
                    $table->string('subdomain', 100)->nullable()->after('company_name');
                }
                if (!Schema::hasColumn('companies', 'economic_code')) {
                    $table->string('economic_code', 50)->nullable()->after('subdomain');
                }
                if (!Schema::hasColumn('companies', 'registration_num')) {
                    $table->string('registration_num', 50)->nullable()->after('economic_code');
                }
                if (!Schema::hasColumn('companies', 'postal_code')) {
                    $table->string('postal_code', 20)->nullable()->after('registration_number');
                }
                if (!Schema::hasColumn('companies', 'province')) {
                    $table->string('province', 100)->nullable()->after('postal_code');
                }
                if (!Schema::hasColumn('companies', 'city')) {
                    $table->string('city', 100)->nullable()->after('province');
                }
                if (!Schema::hasColumn('companies', 'industry')) {
                    $table->string('industry', 100)->nullable()->after('city');
                }
            });
        }

        // 3. Subscriptions Table missing columns
        if (Schema::hasTable('subscriptions')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                if (!Schema::hasColumn('subscriptions', 'order_id')) {
                    $table->unsignedBigInteger('order_id')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('subscriptions', 'package_name')) {
                    $table->string('package_name')->nullable()->after('title');
                }
                if (!Schema::hasColumn('subscriptions', 'plan_name')) {
                    $table->string('plan_name')->nullable()->after('package_name');
                }
                if (!Schema::hasColumn('subscriptions', 'billing_period')) {
                    $table->string('billing_period', 50)->default('monthly')->after('status');
                }
                if (!Schema::hasColumn('subscriptions', 'user_count')) {
                    $table->unsignedInteger('user_count')->default(1)->after('billing_period');
                }
                if (!Schema::hasColumn('subscriptions', 'user_limit')) {
                    $table->unsignedInteger('user_limit')->default(1)->after('user_count');
                }
                if (!Schema::hasColumn('subscriptions', 'price')) {
                    $table->decimal('price', 15, 2)->default(0)->after('user_limit');
                }
                if (!Schema::hasColumn('subscriptions', 'total_price')) {
                    $table->decimal('total_price', 15, 2)->default(0)->after('price');
                }
                if (!Schema::hasColumn('subscriptions', 'order_number')) {
                    $table->string('order_number', 100)->nullable()->after('total_price');
                }
                if (!Schema::hasColumn('subscriptions', 'server_instance')) {
                    $table->string('server_instance')->nullable()->after('order_number');
                }
                if (!Schema::hasColumn('subscriptions', 'starts_at')) {
                    $table->timestamp('starts_at')->nullable()->after('module_ids');
                }
            });
        }

        // 4. Orders Table missing columns
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'order_number')) {
                    $table->string('order_number', 100)->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('orders', 'package_name')) {
                    $table->string('package_name', 191)->nullable()->after('order_number');
                }
                if (!Schema::hasColumn('orders', 'module_ids')) {
                    $table->json('module_ids')->nullable()->after('amount');
                }
                if (!Schema::hasColumn('orders', 'user_count')) {
                    $table->unsignedInteger('user_count')->default(5)->after('module_ids');
                }
                if (!Schema::hasColumn('orders', 'billing_period')) {
                    $table->string('billing_period', 50)->default('monthly')->after('user_count');
                }
                if (!Schema::hasColumn('orders', 'subtotal')) {
                    $table->bigInteger('subtotal')->default(0)->after('amount');
                }
                if (!Schema::hasColumn('orders', 'final_amount')) {
                    $table->bigInteger('final_amount')->default(0)->after('subtotal');
                }
                if (!Schema::hasColumn('orders', 'is_paid')) {
                    $table->boolean('is_paid')->default(false)->after('status');
                }
                if (!Schema::hasColumn('orders', 'tracking_code')) {
                    $table->string('tracking_code', 100)->nullable()->after('is_paid');
                }
                if (!Schema::hasColumn('orders', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('tracking_code');
                }
                if (!Schema::hasColumn('orders', 'coupon_code')) {
                    $table->string('coupon_code', 50)->nullable()->after('paid_at');
                }
                if (!Schema::hasColumn('orders', 'discount_amount')) {
                    $table->bigInteger('discount_amount')->default(0)->after('coupon_code');
                }
                if (!Schema::hasColumn('orders', 'description')) {
                    $table->text('description')->nullable()->after('discount_amount');
                }
            });
        }

        // 5. Gateway Settings Zibal Sandbox default
        if (Schema::hasTable('gateway_settings')) {
            Schema::table('gateway_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('gateway_settings', 'zibal_sandbox')) {
                    $table->boolean('zibal_sandbox')->default(true)->after('zibal_merchant');
                }
            });
            \Illuminate\Support\Facades\DB::table('gateway_settings')
                ->where('id', 1)
                ->where('zibal_merchant', 'zibal')
                ->update(['zibal_sandbox' => 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $columns = ['first_name', 'last_name', 'job_title', 'onboarding_step', 'onboarding_completed_at', 'last_login_at'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('users', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

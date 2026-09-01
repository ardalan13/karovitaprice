<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\SaveCompanyRequest;
use App\Models\User;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\AuditLog;
use Carbon\Carbon;

class UserController extends Controller {
    public function getProfile(Request $request) {
        $user = $request->user();
        return response()->json(['user' => $user]);
    }

    public function updateProfile(UpdateProfileRequest $request) {
        $user = $request->user();
        $validated = $request->validated();
        
        $user->name = $validated['name'];
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['avatar'])) {
            $user->avatar = $validated['avatar'];
        }
        $user->save();

        return response()->json(['user' => $user, 'message' => 'پروفایل به‌روزرسانی شد']);
    }

    public function getCompany(Request $request) {
        $user = $request->user();
        $company = Company::where('user_id', $user->id)->first();
        return response()->json(['data' => $company]);
    }

    public function saveCompany(SaveCompanyRequest $request) {
        $user = $request->user();
        $validated = $request->validated();

        $company = Company::updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $validated['name'],
                'national_id' => $validated['national_id'] ?? null,
                'registration_number' => $validated['registration_number'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]
        );

        AuditLog::create([
            'user_id' => $user->id,
            'action_type' => 'COMPANY_SAVED',
            'action_description' => "ثبت/ویرایش اطلاعات شرکت {$company->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'SUCCESS',
        ]);

        return response()->json(['data' => $company, 'message' => 'اطلاعات شرکت با موفقیت ذخیره شد']);
    }

    public function getPurchasedPackages(Request $request) {
        $user = $request->user();
        $subs = Subscription::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        $result = $subs->map(function ($s) {
            $name = $s->title;
            if (!$name) {
                if (!empty($s->module_ids) && is_array($s->module_ids)) {
                    $name = 'اشتراک ماژول‌های ERP (' . count($s->module_ids) . ' ماژول)';
                } elseif ($s->source === 'trial') {
                    $name = 'اشتراک آزمایشی ۵ روزه کارویتا';
                } else {
                    $name = 'اشتراک سازمانی کارویتا';
                }
            }
            $isActive = ($s->status === 'active' && $s->expires_at > Carbon::now());
            return [
                'id' => $s->id,
                'name' => $name,
                'status' => $s->status,
                'is_active' => $isActive,
                'expires_at' => $s->expires_at->toISOString(),
                'source' => $s->source,
            ];
        });

        return response()->json(['data' => $result]);
    }

    public function getSubscriptions(Request $request) {
        $user = $request->user();
        $subs = Subscription::where('user_id', $user->id)->orderBy('id', 'desc')->get();
        return response()->json(['data' => $subs]);
    }
}

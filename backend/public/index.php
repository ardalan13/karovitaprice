<?php
declare(strict_types=1);require dirname(__DIR__).'/src/bootstrap.php';
use App\Controllers\{AuthController,ShopController,OnboardingController,AdminController};
header('Access-Control-Allow-Origin: '.env('FRONTEND_URL','http://localhost:5173'));header('Access-Control-Allow-Headers: Content-Type, Authorization');header('Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS');if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code(204);exit;}
$p=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);$m=$_SERVER['REQUEST_METHOD'];
try{
 if($m==='GET'&&preg_match('#^/api/invoices/(\d+)$#',$p,$z))(new ShopController)->invoice((int)$z[1]);
 match("$m $p"){
  'POST /api/auth/otp/request'=>(new AuthController)->requestOtp(),'POST /api/auth/otp/verify'=>(new AuthController)->verifyOtp(),
  'GET /api/onboarding'=>(new OnboardingController)->status(),'POST /api/onboarding/user'=>(new OnboardingController)->userInfo(),'POST /api/onboarding/company'=>(new OnboardingController)->company(),'GET /api/profile','PUT /api/profile'=>(new OnboardingController)->profile(),
  'GET /api/packages'=>(new ShopController)->packages(),'POST /api/trial'=>(new ShopController)->trial(),'POST /api/orders'=>(new ShopController)->order(),'GET /api/payments/callback','POST /api/payments/callback'=>(new ShopController)->callback(),'GET /api/dashboard'=>(new ShopController)->dashboard(),
  'GET /api/admin/overview'=>(new AdminController)->overview(),'GET /api/admin/users'=>(new AdminController)->users(),'GET /api/admin/packages','POST /api/admin/packages'=>(new AdminController)->packages(),'GET /api/admin/orders'=>(new AdminController)->orders(),'GET /api/admin/subscriptions','PUT /api/admin/subscriptions'=>(new AdminController)->subscriptions(),
  default=>jsonResponse(['message'=>'مسیر یافت نشد.'],404)
 };
}catch(Throwable$e){error_log((string)$e);jsonResponse(['message'=>env('APP_ENV')==='local'?$e->getMessage():'خطای داخلی سرور'],500);}

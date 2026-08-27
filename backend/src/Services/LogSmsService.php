<?php
namespace App\Services;
final class LogSmsService implements SmsService{public function sendOtp(string$m,string$c):array{$d=dirname(__DIR__,2).'/storage';if(!is_dir($d))mkdir($d,0775,true);file_put_contents($d.'/sms.log',date('c')." $m OTP=$c\n",FILE_APPEND);return['message_id'=>'log-'.bin2hex(random_bytes(4)),'request'=>[],'response'=>['logged'=>true]];}}

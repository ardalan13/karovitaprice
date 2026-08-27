<?php
namespace App\Services;
interface SmsService{public function sendOtp(string$mobile,string$code):array;}


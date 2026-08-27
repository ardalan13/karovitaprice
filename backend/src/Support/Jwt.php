<?php
namespace App\Support;
final class Jwt{public static function issue(int$id):string{$h=self::b(json_encode(['alg'=>'HS256','typ'=>'JWT']));$p=self::b(json_encode(['sub'=>$id,'iat'=>time(),'exp'=>time()+3600]));return"$h.$p.".self::b(hash_hmac('sha256',"$h.$p",env('APP_KEY'),true));}public static function userId():?int{$a=$_SERVER['HTTP_AUTHORIZATION']??'';if(!preg_match('/Bearer\s+(\S+)/',$a,$m))return null;$x=explode('.',$m[1]);if(count($x)!==3)return null;[$h,$p,$s]=$x;if(!hash_equals(self::b(hash_hmac('sha256',"$h.$p",env('APP_KEY'),true)),$s))return null;$d=json_decode(base64_decode(strtr($p,'-_','+/')),true);return($d['exp']??0)>=time()?(int)$d['sub']:null;}private static function b(string$v):string{return rtrim(strtr(base64_encode($v),'+/','-_'),'=');}}


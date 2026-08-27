<?php
declare(strict_types=1);
spl_autoload_register(function(string $class):void{$prefix='App\\';if(!str_starts_with($class,$prefix))return;$file=__DIR__.'/'.str_replace('\\','/',substr($class,strlen($prefix))).'.php';if(is_file($file))require $file;});
function env(string $key,mixed $default=null):mixed{static $v;if($v===null){$v=[];$f=dirname(__DIR__).'/.env';if(is_file($f))foreach(file($f,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES)as$l){if(str_starts_with(trim($l),'#')||!str_contains($l,'='))continue;[$k,$x]=array_map('trim',explode('=',$l,2));$v[$k]=$x;}}return $v[$key]??getenv($key)?:$default;}
function db():PDO{static $p;return $p??=new PDO('mysql:host='.env('DB_HOST','127.0.0.1').';port='.env('DB_PORT','3306').';dbname='.env('DB_DATABASE','product_dashboard').';charset=utf8mb4',env('DB_USERNAME','root'),env('DB_PASSWORD',''),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);}
function body():array{return json_decode(file_get_contents('php://input'),true)?:[];}
function jsonResponse(array $d,int $s=200):never{http_response_code($s);header('Content-Type: application/json; charset=utf-8');echo json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}


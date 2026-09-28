import json, ftplib, io, urllib.request

records = json.load(open('D:/karovitaprice-main/karovitaprice-main/import_prepared_records.json', encoding='utf-8'))
json_payload = json.dumps(records, ensure_ascii=False)

with open('D:/karovitaprice-main/karovitaprice-main/public/api/index.php', 'r', encoding='utf-8') as f:
    api_code = f.read()

import_endpoint = """if ($path === '/import-excel-customers-secure-action' && $method === 'POST') {
    $raw = file_get_contents('php://input');
    $items = json_decode($raw, true) ?: [];
    if (empty($items)) {
        sendError('No data provided', 400);
    }
    
    $importedUsers = 0;
    $updatedUsers = 0;
    $importedCompanies = 0;
    $importedSubs = 0;
    $errors = [];
    
    foreach ($items as $item) {
        $mobile = trim($item['mobile'] ?? '');
        if (empty($mobile)) continue;
        
        $firstName = $item['first_name'] ?? '';
        $lastName = $item['last_name'] ?? '';
        $fullName = trim($firstName . ' ' . $lastName);
        $email = $item['email'] ?: null;
        $jobTitle = $item['job_title'] ?: 'مدیرعامل';
        $companyName = trim($item['company_name'] ?? '');
        $province = $item['province'] ?: 'مازندران';
        $city = $item['city'] ?: '';
        $industry = $item['industry'] ?: 'سایر';
        $moduleIds = $item['module_ids'] ?? [];
        $userCount = (int)($item['user_count'] ?? 1);
        $startsAt = $item['starts_at'] ?? date('Y-m-d H:i:s');
        $expiresAt = $item['expires_at'] ?? date('Y-m-d H:i:s', strtotime('+1 year'));
        $price = (float)($item['price'] ?? 0);
        $period = $item['billing_period'] ?: 'yearly';
        
        try {
            // 1. Check or Insert User
            $uStmt = $pdo->prepare("SELECT id, role FROM users WHERE mobile = ? LIMIT 1");
            $uStmt->execute([$mobile]);
            $existingUser = $uStmt->fetch();
            
            if (!$existingUser) {
                $insUser = $pdo->prepare("INSERT INTO users (mobile, name, first_name, last_name, email, job_title, role, status, is_active, onboarding_step, onboarding_completed_at, created_at, updated_at) 
                                         VALUES (?, ?, ?, ?, ?, ?, 'user', 'active', 1, 4, NOW(), ?, NOW())");
                $insUser->execute([$mobile, $fullName, $firstName, $lastName, $email, $jobTitle, $startsAt]);
                $userId = (int)$pdo->lastInsertId();
                $importedUsers++;
            } else {
                $userId = (int)$existingUser['id'];
                // Keep admin role if already admin, update job_title
                $upUser = $pdo->prepare("UPDATE users SET job_title = ?, email = COALESCE(email, ?), name = COALESCE(name, ?), onboarding_step = 4 WHERE id = ?");
                $upUser->execute([$jobTitle, $email, $fullName, $userId]);
                $updatedUsers++;
            }
            
            // 2. Check or Insert Company
            $cStmt = $pdo->prepare("SELECT id FROM companies WHERE user_id = ? AND name = ? LIMIT 1");
            $cStmt->execute([$userId, $companyName]);
            $comp = $cStmt->fetchColumn();
            
            if (!$comp) {
                $insComp = $pdo->prepare("INSERT INTO companies (user_id, name, industry, province, city, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
                $insComp->execute([$userId, $companyName, $industry, $province, $city, $mobile, $startsAt]);
                $importedCompanies++;
            }
            
            // 3. Insert Subscription
            $subTitle = "اشتراک اختصاصی ابری {$companyName} (" . count($moduleIds) . " ماژول)";
            $subJsonMods = json_encode($moduleIds, JSON_UNESCAPED_UNICODE);
            $instanceJson = json_encode([
                'subdomain' => 'app-' . $userId . '.karovita.ir',
                'portal_url' => '/workspace/' . $userId,
                'status' => 'online',
                'ssl' => true,
                'database' => 'MySQL 8 Enterprise',
                'backup_status' => 'خودکار روزانه',
                'datacenter' => 'دیتاسنتر ابری تهران - آسیاتک'
            ], JSON_UNESCAPED_UNICODE);
            
            // Check if subscription already exists for this user and company
            $sCheck = $pdo->prepare("SELECT id FROM subscriptions WHERE user_id = ? AND (title = ? OR package_name = ?)");
            $sCheck->execute([$userId, $subTitle, $subTitle]);
            $subExists = $sCheck->fetchColumn();
            
            if (!$subExists) {
                $insSub = $pdo->prepare("INSERT INTO subscriptions (user_id, title, package_name, status, is_active, source, billing_period, user_count, user_limit, price, total_price, order_number, module_ids, server_instance, starts_at, expires_at, created_at, updated_at) 
                                        VALUES (?, ?, ?, 'active', 1, 'purchase', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                $orderNum = 'SUB-' . date('Ymd', strtotime($startsAt)) . '-' . rand(1000, 9999);
                $insSub->execute([
                    $userId,
                    $subTitle,
                    $subTitle,
                    $period,
                    $userCount,
                    $userCount,
                    $price,
                    $price,
                    $orderNum,
                    $subJsonMods,
                    $instanceJson,
                    $startsAt,
                    $expiresAt,
                    $startsAt
                ]);
                $importedSubs++;
            }
        } catch (Exception $ex) {
            $errors[] = ['item' => $companyName, 'mobile' => $mobile, 'error' => $ex->getMessage()];
        }
    }
    
    sendJson([
        'success' => true,
        'imported_users' => $importedUsers,
        'updated_users' => $updatedUsers,
        'imported_companies' => $importedCompanies,
        'imported_subscriptions' => $importedSubs,
        'errors_count' => count($errors),
        'errors' => $errors
    ]);
}
"""

target_anchor = "if ($path === '/' || $path === '/health' || $path === '/ping' || $path === '/api/health') {"
assert target_anchor in api_code, 'target_anchor not found'
updated_api_code = api_code.replace(target_anchor, import_endpoint + "\n" + target_anchor, 1)

ftp = ftplib.FTP()
ftp.connect('karovita.ir', 21, timeout=15)
ftp.login('hermes@karovita.ir', '249rFp4sRNUm7dAn')
ftp.cwd('/public_html/api')
ftp.storbinary('STOR index.php', io.BytesIO(updated_api_code.encode('utf-8')))
ftp.quit()
print('Uploaded index.php with updated import endpoint to FTP')

req = urllib.request.Request(
    'https://panel.karovita.ir/api/import-excel-customers-secure-action',
    data=json_payload.encode('utf-8'),
    headers={
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
    },
    method='POST'
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print('Import Response:', json.dumps(res, indent=2, ensure_ascii=False))

ftp = ftplib.FTP()
ftp.connect('karovita.ir', 21, timeout=15)
ftp.login('hermes@karovita.ir', '249rFp4sRNUm7dAn')
ftp.cwd('/public_html/api')
ftp.storbinary('STOR index.php', io.BytesIO(api_code.encode('utf-8')))
ftp.quit()
print('Restored original index.php on FTP')

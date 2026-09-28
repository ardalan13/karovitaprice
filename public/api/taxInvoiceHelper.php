<?php
/**
 * Official Iranian Tax Authority Invoice Generator (PHP Backend)
 * KaroVita Cloud ERP - Compliant with Law Article 169 & Moadian System
 */

if (!function_exists('generateTaxId')) {
    function generateTaxId($orderId, $dateStr = null) {
        $cleanId = is_numeric($orderId) ? (int)$orderId : (int)preg_replace('/\D/', '', (string)$orderId);
        if ($cleanId <= 0) $cleanId = 1000;
        $seed = $cleanId * 739;
        $hex = strtoupper(str_pad(dechex($seed + 0x1A2B3C), 8, '0', STR_PAD_LEFT));
        $ts = !empty($dateStr) ? strtotime($dateStr) : time();
        $year = substr(date('Y', $ts), -2);
        $dayOfYear = str_pad(date('z', $ts), 3, '0', STR_PAD_LEFT);
        return "A10F-{$year}{$dayOfYear}-" . substr($hex, 0, 4) . '-' . substr($hex, 4, 4);
    }
}

if (!function_exists('gregorian_to_jalali')) {
    function gregorian_to_jalali($gy, $gm, $gd) {
        $g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        if ($gy > 1600) {
            $jy = 979;
            $gy -= 1600;
        } else {
            $jy = 0;
            $gy -= 621;
        }
        $gy2 = ($gm > 2) ? ($gy + 1) : $gy;
        $days = (365 * $gy) + ((int)(($gy2 + 3) / 4)) - ((int)(($gy2 + 99) / 100)) + ((int)(($gy2 + 399) / 400)) - 80 + $gd + $g_d_m[$gm - 1];
        $jy += 33 * ((int)($days / 12053));
        $days %= 12053;
        $jy += 4 * ((int)($days / 1461));
        $days %= 1461;
        if ($days > 365) {
            $jy += (int)(($days - 1) / 365);
            $days = ($days - 1) % 365;
        }
        $jm = ($days < 186) ? 1 + (int)($days / 31) : 7 + (int)(($days - 186) / 30);
        $jd = 1 + (($days < 186) ? ($days % 31) : (($days - 186) % 30));
        return [$jy, $jm, $jd];
    }
}

if (!function_exists('numberToWordsPersian')) {
    function numberToWordsPersian($num) {
        $num = (int)$num;
        if ($num === 0) return 'صفر تومان';
        if ($num < 0) return 'منفی ' . numberToWordsPersian(abs($num));
        $yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
        $dahha = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
        $dahha10_19 = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
        $sadha = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
        $tabaghat = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];
        $convertGroup = function($n) use ($yekan, $dahha, $dahha10_19, $sadha) {
            $res = '';
            $s = (int)($n / 100); $d = (int)(($n % 100) / 10); $y = $n % 10;
            if ($s > 0) $res .= $sadha[$s];
            if ($d === 1) {
                if ($res !== '') $res .= ' و ';
                $res .= $dahha10_19[$y];
            } else {
                if ($d > 1) { if ($res !== '') $res .= ' و '; $res .= $dahha[$d]; }
                if ($y > 0) { if ($res !== '') $res .= ' و '; $res .= $yekan[$y]; }
            }
            return $res;
        };
        $parts = []; $temp = $num; $groupIdx = 0;
        while ($temp > 0) {
            $group = $temp % 1000;
            if ($group > 0) {
                $groupText = $convertGroup($group);
                $suffix = !empty($tabaghat[$groupIdx]) ? ' ' . $tabaghat[$groupIdx] : '';
                array_unshift($parts, $groupText . $suffix);
            }
            $temp = (int)($temp / 1000); $groupIdx++;
        }
        return implode(' و ', $parts) . ' تومان';
    }
}

if (!function_exists('getOfficialSellerInfo')) {
    function getOfficialSellerInfo($pdo = null) {
        $default = [
            'company_name' => 'معماران رشد و تحول کسب و کار (کارویتا)',
            'brand_name' => 'معماران رشد و تحول کسب و کار (کارویتا)',
            'registration_number' => '10506',
            'national_id' => '14015285185',
            'tracking_number' => '3880354536',
            'economic_code' => '3880354536',
            'postal_code' => '4713998571',
            'province' => 'مازندران',
            'city' => 'بابل',
            'address' => 'خیابان نواب صفوی - اشرفی۲۷ - پلاک 5',
            'phone' => '01132250771',
            'email' => 'info@karovota.ir',
            'stamp_title' => 'امور مالی و قراردادها'
        ];

        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM seller_settings ORDER BY id ASC LIMIT 1");
                $row = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
                if ($row && !empty($row['company_name'])) {
                    $filtered = array_filter($row, function($v) { return $v !== null && $v !== ''; });
                    return array_merge($default, $filtered);
                }
            } catch (Exception $e) {}
        }

        $configPaths = [
            __DIR__ . '/seller_config.json',
            __DIR__ . '/../seller_config.json',
            dirname(__DIR__) . '/seller_config.json'
        ];
        foreach ($configPaths as $cp) {
            if (file_exists($cp)) {
                $raw = @file_get_contents($cp);
                if ($raw) {
                    $json = json_decode($raw, true);
                    if (is_array($json) && !empty($json['company_name'])) {
                        $filtered = array_filter($json, function($v) { return $v !== null && $v !== ''; });
                        return array_merge($default, $filtered);
                    }
                }
            }
        }

        return $default;
    }
}

if (!function_exists('saveOfficialSellerInfo')) {
    function saveOfficialSellerInfo($pdo, $data) {
        $fields = [
            'company_name', 'brand_name', 'registration_number', 'national_id',
            'economic_code', 'tax_payer_code', 'postal_code', 'province', 'city',
            'address', 'phone', 'email', 'stamp_title'
        ];
        $clean = [];
        foreach ($fields as $f) {
            $clean[$f] = trim((string)($data[$f] ?? ''));
        }

        $configPath = __DIR__ . '/seller_config.json';
        @file_put_contents($configPath, json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if ($pdo) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS `seller_settings` (
                    `id` INT PRIMARY KEY AUTO_INCREMENT,
                    `company_name` VARCHAR(255) NOT NULL DEFAULT 'شرکت داده‌پردازان ابری کارویتا (سهامی خاص)',
                    `brand_name` VARCHAR(255) NOT NULL DEFAULT 'کارویتا ابری (Karovita Cloud ERP)',
                    `registration_number` VARCHAR(50) NOT NULL DEFAULT '10506',
                    `national_id` VARCHAR(50) NOT NULL DEFAULT '14015285185',
                    `economic_code` VARCHAR(50) NOT NULL DEFAULT '3880354536',
                    `tax_payer_code` VARCHAR(50) NOT NULL DEFAULT 'TP-10506-TX',
                    `postal_code` VARCHAR(20) NOT NULL DEFAULT '1997985614',
                    `province` VARCHAR(100) NOT NULL DEFAULT 'تهران',
                    `city` VARCHAR(100) NOT NULL DEFAULT 'تهران',
                    `address` TEXT NOT NULL,
                    `phone` VARCHAR(50) NOT NULL DEFAULT '021-88990011',
                    `email` VARCHAR(100) NOT NULL DEFAULT 'finance@karovita.ir',
                    `stamp_title` VARCHAR(255) NOT NULL DEFAULT 'امور مالی و قراردادها',
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

                $stmt = $pdo->query("SELECT id FROM seller_settings ORDER BY id ASC LIMIT 1");
                $existing = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
                if ($existing && !empty($existing['id'])) {
                    $setClauses = [];
                    $params = [];
                    foreach ($clean as $col => $val) {
                        $setClauses[] = "`$col` = ?";
                        $params[] = $val;
                    }
                    $params[] = $existing['id'];
                    $sql = "UPDATE seller_settings SET " . implode(', ', $setClauses) . " WHERE id = ?";
                    $upd = $pdo->prepare($sql);
                    $upd->execute($params);
                } else {
                    $cols = array_keys($clean);
                    $placeholders = array_fill(0, count($cols), '?');
                    $sql = "INSERT INTO seller_settings (`" . implode('`, `', $cols) . "`) VALUES (" . implode(', ', $placeholders) . ")";
                    $ins = $pdo->prepare($sql);
                    $ins->execute(array_values($clean));
                }
            } catch (Exception $e) {}
        }

        return $clean;
    }
}

if (!function_exists('getDefaultModules')) {
    function getDefaultModules($pdo = null) {
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT id, title, price FROM pricing_modules WHERE deleted_at IS NULL");
                $mods = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
                if (!empty($mods)) return $mods;
            } catch (Exception $e) {}
            try {
                $stmt = $pdo->query("SELECT id, title, price FROM erp_modules WHERE deleted_at IS NULL");
                $mods = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
                if (!empty($mods)) return $mods;
            } catch (Exception $e) {}
        }

        return [
            ['id' => 'account', 'title' => 'حسابداری و امور مالی', 'price' => 300000],
            ['id' => 'activities', 'title' => 'اقدامات و پیگیری‌ها', 'price' => 90000],
            ['id' => 'ai_assistant', 'title' => 'دستیار هوش مصنوعی', 'price' => 250000],
            ['id' => 'calendar', 'title' => 'گاهشمار و تقویم کاری', 'price' => 0],
            ['id' => 'contacts', 'title' => 'مخاطبان و اشخاص', 'price' => 0],
            ['id' => 'crm', 'title' => 'مدیریت ارتباط با مشتری (CRM)', 'price' => 350000],
            ['id' => 'helpdesk', 'title' => 'پشتیبانی و تیکتینگ', 'price' => 250000],
            ['id' => 'hr', 'title' => 'مدیریت منابع انسانی و پرسنل', 'price' => 130000],
            ['id' => 'hr_attendance', 'title' => 'حضور و غیاب پرسنل', 'price' => 100000],
            ['id' => 'hr_holidays', 'title' => 'مرخصی و ماموریت', 'price' => 50000],
            ['id' => 'hr_payroll', 'title' => 'حقوق و دستمزد', 'price' => 250000],
            ['id' => 'hr_recruitment', 'title' => 'جذب و استخدام پرسنل', 'price' => 180000],
            ['id' => 'hr_timesheet', 'title' => 'ثبت ساعت کارکرد (تایم‌شیت)', 'price' => 90000],
            ['id' => 'im_livechat', 'title' => 'گفتگوی آنلاین وب‌سایت', 'price' => 120000],
            ['id' => 'knowledge', 'title' => 'پایگاه دانش سازمانی', 'price' => 80000],
            ['id' => 'loyalty', 'title' => 'باشگاه مشتریان و وفاداری', 'price' => 220000],
            ['id' => 'mail', 'title' => 'صندوق پیام و مکاتبات داخلی', 'price' => 0],
            ['id' => 'mass_mailing_sms', 'title' => 'سامانه پیامک و اطلاع‌رسانی', 'price' => 100000],
            ['id' => 'sms', 'title' => 'سامانه پیامک و اطلاع‌رسانی', 'price' => 100000],
            ['id' => 'project', 'title' => 'مدیریت پروژه و وظایف', 'price' => 150000],
            ['id' => 'sale', 'title' => 'فروش و صدور فاکتور', 'price' => 250000],
            ['id' => 'stock', 'title' => 'انبارداری و کنترل موجودی', 'price' => 250000],
            ['id' => 'inventory', 'title' => 'انبارداری و کنترل موجودی', 'price' => 250000],
            ['id' => 'purchase', 'title' => 'خرید و تدارکات', 'price' => 200000],
            ['id' => 'survey', 'title' => 'فرم‌ساز و پرسشنامه آنلاین', 'price' => 150000],
            ['id' => 'survey_feedback', 'title' => 'نظرسنجی و رضایت‌سنجی', 'price' => 250000],
        ];
    }
}

if (!function_exists('renderOfficialTaxInvoiceHtml')) {
    function renderOfficialTaxInvoiceHtml($order, $tx, $company, $customSeller = null, $pdo = null) {
        $seller = getOfficialSellerInfo($pdo);
        if (is_array($customSeller) && !empty($customSeller)) {
            $seller = array_merge($seller, array_filter($customSeller, function($v) { return $v !== null && $v !== ''; }));
        }

        $orderNum = $order['order_number'] ?? ('ORD-' . ($order['id'] ?? '1001'));
        $createdAt = !empty($order['created_at']) ? strtotime($order['created_at']) : time();
        $gy = (int)date('Y', $createdAt);
        $gm = (int)date('n', $createdAt);
        $gd = (int)date('j', $createdAt);
        list($jy, $jm, $jd) = gregorian_to_jalali($gy, $gm, $gd);
        $dateFa = sprintf('%04d/%02d/%02d', $jy, $jm, $jd);
        $timeFa = date('H:i', $createdAt);
        $taxId = generateTaxId($order['id'] ?? 1, $order['created_at'] ?? null);
        $isPaid = (!empty($order['is_paid']) || ($order['status'] ?? '') === 'paid' || ($order['status'] ?? '') === 'completed' || ($tx['status'] ?? '') === 'successful');

        $buyerName = ($company['company_name'] ?? '') ?: (($company['name'] ?? '') ?: trim(($order['first_name'] ?? '') . ' ' . ($order['last_name'] ?? '')));
        if (empty($buyerName)) $buyerName = $order['mobile'] ?? 'مشترک محترم';

        $buyerEconomicCode = trim($company['economic_code'] ?? '') ?: (trim($order['user_economic_code'] ?? '') ?: (trim($order['economic_code'] ?? '') ?: '—'));
        $buyerNationalId = trim($company['national_id'] ?? '') ?: (trim($order['national_code'] ?? '') ?: (trim($order['national_id'] ?? '') ?: ($order['mobile'] ?? '—')));
        $buyerRegNo = trim($company['registration_number'] ?? '') ?: (trim($company['registration_num'] ?? '') ?: '—');
        $buyerPostalCode = trim($company['postal_code'] ?? '') ?: '—';
        $buyerPhone = trim($company['phone'] ?? '') ?: ($order['mobile'] ?? '—');

        $bProv = trim($company['province'] ?? '');
        $bCity = trim($company['city'] ?? '');
        $buyerLocation = ($bProv && $bCity) ? "{$bProv} / {$bCity}" : ($bProv ?: ($bCity ?: '—'));

        $buyerAddress = trim($company['address'] ?? '');
        if (empty($buyerAddress)) {
            if (!empty($bProv)) {
                $buyerAddress = $bProv . (!empty($bCity) ? '، ' . $bCity : '');
            } else {
                $buyerAddress = '—';
            }
        }

        $finalAmount = (int)($tx['amount'] ?? ($order['final_amount'] ?? ($order['amount'] ?? 0)));
        $vatRate = 0.10;

        $baseBeforeVat = (int)($order['subtotal'] ?? 0);
        if ($baseBeforeVat <= 0 || $baseBeforeVat >= $finalAmount) {
            $baseBeforeVat = (int)round($finalAmount / (1 + $vatRate));
        }
        $vatAmount = $finalAmount - $baseBeforeVat;
        if ($vatAmount < 0) $vatAmount = 0;

        $discountAmount = max(0, (int)($order['discount_amount'] ?? 0));
        $rawTotal = $baseBeforeVat + $discountAmount;
        $amountInWords = numberToWordsPersian($finalAmount);

        $isResourceAddon = !empty($order['is_resource_addon']) || in_array($order['order_type'] ?? '', ['resource_upgrade', 'addon', 'module_addon', 'module']);
        $remainingMonths = (int)($order['breakdown']['remaining_months'] ?? 0);
        $period = strtolower($order['billing_period'] ?? 'yearly');
        $unitMultiplier = 1;
        if ($isResourceAddon && $remainingMonths > 0) {
            $unitMultiplier = $remainingMonths;
            $periodTitleFa = "مدت باقیمانده اشتراک ({$remainingMonths} ماه گردشده به سقف)";
        } elseif ($period === 'yearly' || $period === '12_months') {
            $unitMultiplier = 10;
            $periodTitleFa = "۱ ساله (معادل ۱۰ ماه + ۲ ماه هدیه)";
        } elseif ($period === '6_months' || $period === 'semiannual') {
            $unitMultiplier = 6;
            $periodTitleFa = "۶ ماهه";
        } elseif ($period === '3_months' || $period === 'quarterly') {
            $unitMultiplier = 3;
            $periodTitleFa = "۳ ماهه";
        } else {
            $unitMultiplier = 1;
            $periodTitleFa = "ماهانه";
        }

        $rawMods = $order['module_ids'] ?? [];
        if (is_string($rawMods)) {
            $rawMods = json_decode($rawMods, true) ?: ($rawMods ? [$rawMods] : []);
        }
        $cleanModIds = [];
        if (is_array($rawMods)) {
            foreach ($rawMods as $mid) {
                $mKey = is_array($mid) ? ($mid['id'] ?? '') : (string)$mid;
                $mKey = trim($mKey);
                if ($mKey !== '') $cleanModIds[] = $mKey;
            }
        }
        $allModules = getDefaultModules();
        $modCatalog = [];
        foreach ($allModules as $m) {
            $modCatalog[strtolower($m['id'])] = [
                'title' => $m['title'],
                'price' => (int)($m['price'] ?? 250000)
            ];
        }

        $extraUsersCount = (int)($order['breakdown']['extra_users_count'] ?? (isset($order['user_count']) && (int)$order['user_count'] > 1 ? (int)$order['user_count'] - 1 : 0));
        $monthlyExtraCost = (int)($order['breakdown']['extra_users_cost'] ?? 0);
        $extraUsersPeriodTotal = $isResourceAddon ? $monthlyExtraCost : ($monthlyExtraCost * $unitMultiplier);
        $allocatedUsersBase = 0;
        if ($extraUsersCount > 0 && $monthlyExtraCost > 0) {
            $allocatedUsersBase = min($extraUsersPeriodTotal, (int)round($baseBeforeVat * 0.5));
        }
        $modulesAvailableBase = max(0, $baseBeforeVat - $allocatedUsersBase);

        $itemRowsHtml = '';
        $rowIdx = 1;

        if (!empty($cleanModIds)) {
            $modDetails = [];
            foreach ($cleanModIds as $modId) {
                $lowId = strtolower($modId);
                $found = $modCatalog[$lowId] ?? null;
                $catPrice = ($found && $found['price'] > 0) ? $found['price'] : 250000;
                $title = $found ? $found['title'] : $modId;
                $modDetails[] = [
                    'id' => $modId,
                    'title' => $title,
                    'catalogPrice' => $catPrice
                ];
            }

            $sumCatalog = array_sum(array_column($modDetails, 'catalogPrice'));
            $cumulativeBase = 0;
            $cumulativeVat = 0;
            $countMods = count($modDetails);

            foreach ($modDetails as $idx => $mod) {
                $isLast = ($idx === $countMods - 1);
                if ($isLast) {
                    $rowBase = max(0, $modulesAvailableBase - $cumulativeBase);
                } else {
                    $ratio = $sumCatalog > 0 ? ($mod['catalogPrice'] / $sumCatalog) : (1 / $countMods);
                    $rowBase = (int)round($modulesAvailableBase * $ratio);
                    $cumulativeBase += $rowBase;
                }

                if ($isLast && $allocatedUsersBase === 0) {
                    $rowVat = max(0, $vatAmount - $cumulativeVat);
                } else {
                    $rowVat = (int)round($rowBase * $vatRate);
                    $cumulativeVat += $rowVat;
                }

                $rowTotalWithVat = $rowBase + $rowVat;
                $unitPrice = $unitMultiplier > 0 ? (int)round($rowBase / $unitMultiplier) : $rowBase;

                $itemRowsHtml .= '<tr>
                    <td style="text-align:center;">' . ($rowIdx++) . '</td>
                    <td style="font-family:monospace; text-align:center;">KAR-' . strtoupper($mod['id']) . '</td>
                    <td>
                        <strong>حق بهره‌برداری ماژول نرم‌افزاری: ' . htmlspecialchars($mod['title']) . '</strong>
                        <div style="font-size:10px; color:#64748b; margin-top:2px;">لایسنس ابری ' . $periodTitleFa . ' - پشتیبانی و نگهداری تخصصی</div>
                    </td>
                    <td style="text-align:center;">' . $unitMultiplier . '</td>
                    <td style="text-align:center;">ماه</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($unitPrice) . '</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($rowBase) . '</td>
                    <td style="text-align:left; font-family:monospace;">۰</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($rowBase) . '</td>
                    <td style="text-align:center;">۱۰٪</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($rowVat) . '</td>
                    <td style="text-align:left; font-family:monospace; font-weight:bold;">' . number_format($rowTotalWithVat) . '</td>
                </tr>';
            }

            if ($allocatedUsersBase > 0 && $extraUsersCount > 0) {
                $userVat = max(0, $vatAmount - $cumulativeVat);
                $userTotal = $allocatedUsersBase + $userVat;
                $userUnitPrice = (int)round($allocatedUsersBase / ($extraUsersCount * max($unitMultiplier, 1)));

                $itemRowsHtml .= '<tr>
                    <td style="text-align:center;">' . ($rowIdx++) . '</td>
                    <td style="font-family:monospace; text-align:center;">KAR-EXTRA-USR</td>
                    <td>
                        <strong>لایسنس و حق دسترسی کاربران مازاد سامانه ابری کارویتا</strong>
                        <div style="font-size:10px; color:#64748b; margin-top:2px;">اشتراک دسترسی ابری ' . $periodTitleFa . ' برای ' . $extraUsersCount . ' کاربر مازاد بر سقف پایه</div>
                    </td>
                    <td style="text-align:center;">' . $extraUsersCount . '</td>
                    <td style="text-align:center;">کاربر (' . $unitMultiplier . ' ماه)</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($userUnitPrice * $unitMultiplier) . '</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($allocatedUsersBase) . '</td>
                    <td style="text-align:left; font-family:monospace;">۰</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($allocatedUsersBase) . '</td>
                    <td style="text-align:center;">۱۰٪</td>
                    <td style="text-align:left; font-family:monospace;">' . number_format($userVat) . '</td>
                    <td style="text-align:left; font-family:monospace; font-weight:bold;">' . number_format($userTotal) . '</td>
                </tr>';
            }
        } else {
            $pkgTitle = !empty($order['package_name']) ? $order['package_name'] : 'اشتراک و لایسنس جامع سامانه ابری کارویتا';
            $uCount = (int)($order['user_count'] ?? 1);
            $itemRowsHtml .= '<tr>
                <td style="text-align:center;">۱</td>
                <td style="font-family:monospace; text-align:center;">KAR-ERP-LIC</td>
                <td>
                    <strong>' . htmlspecialchars($pkgTitle) . '</strong>
                    <div style="font-size:10px; color:#64748b; margin-top:2px;">شامل دسترسی به زیرساخت ابری، لایسنس کاربری (' . $uCount . ' کاربر) و نگهداری سرویس</div>
                </td>
                <td style="text-align:center;">۱</td>
                <td style="text-align:center;">دوره ' . $periodTitleFa . '</td>
                <td style="text-align:left; font-family:monospace;">' . number_format($baseBeforeVat) . '</td>
                <td style="text-align:left; font-family:monospace;">' . number_format($baseBeforeVat) . '</td>
                <td style="text-align:left; font-family:monospace;">' . number_format($discountAmount) . '</td>
                <td style="text-align:left; font-family:monospace;">' . number_format($baseBeforeVat) . '</td>
                <td style="text-align:center;">۱۰٪</td>
                <td style="text-align:left; font-family:monospace;">' . number_format($vatAmount) . '</td>
                <td style="text-align:left; font-family:monospace; font-weight:bold;">' . number_format($finalAmount) . '</td>
            </tr>';
        }

        $statusStamp = $isPaid 
            ? '<div class="stamp-paid"><div class="stamp-inner"><span>پرداخت و تسویه شد</span><small>شاپرک زیبال</small></div></div>'
            : '<div class="stamp-pending"><div class="stamp-inner"><span>پیش‌فاکتور معتبر</span><small>در انتظار پرداخت</small></div></div>';

        $txTracking = !empty($tx['reference_id']) ? $tx['reference_id'] : (!empty($order['tracking_code']) ? $order['tracking_code'] : ($isPaid ? 'PAY-ONLINE-SHAPARAK' : 'در انتظار پرداخت'));

        return renderOfficialTaxInvoiceHtmlView([
            'order' => $order,
            'tx' => $tx,
            'seller' => $seller,
            'orderNum' => $orderNum,
            'dateFa' => $dateFa,
            'timeFa' => $timeFa,
            'taxId' => $taxId,
            'statusStamp' => $statusStamp,
            'buyerName' => $buyerName,
            'buyerNationalId' => $buyerNationalId,
            'buyerEconomicCode' => $buyerEconomicCode,
            'buyerRegNo' => $buyerRegNo,
            'buyerPostalCode' => $buyerPostalCode,
            'buyerPhone' => $buyerPhone,
            'buyerLocation' => $buyerLocation,
            'buyerAddress' => $buyerAddress,
            'company' => $company,
            'txTracking' => $txTracking,
            'itemRowsHtml' => $itemRowsHtml,
            'rawTotal' => $rawTotal,
            'discountAmount' => $discountAmount,
            'baseBeforeVat' => $baseBeforeVat,
            'vatAmount' => $vatAmount,
            'finalAmount' => $finalAmount,
            'amountInWords' => $amountInWords,
            'isPaid' => $isPaid
        ]);
    }
}



if (!function_exists('renderOfficialTaxInvoiceHtmlView')) {
    function renderOfficialTaxInvoiceHtmlView($d) {
        $order = $d['order'];
        $seller = $d['seller'];
        $company = $d['company'];

        $html = '<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>صورتحساب رسمی استاندارد مالیاتی - ' . htmlspecialchars($d['orderNum']) . '</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 8mm 8mm 8mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: "IRANSans", "Vazirmatn", Tahoma, "Segoe UI", sans-serif; margin: 0; padding: 16px; background: #f1f5f9; color: #0f172a; font-size: 11.5px; line-height: 1.5; }
    .print-actions { max-width: 210mm; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
    .btn-print { background: #0870d1; color: #ffffff; border: none; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .btn-outline { background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .invoice-wrapper { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; padding: 12mm 10mm; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: relative; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .header-table td { vertical-align: middle; }
    .main-title { font-size: 15px; font-weight: 900; color: #0f172a; text-align: center; margin: 0; }
    .sub-title { font-size: 11px; color: #475569; text-align: center; margin: 2px 0 0; }
    .meta-box { font-size: 10.5px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; line-height: 1.6; }
    .section-title { background: #e2e8f0; border: 1px solid #94a3b8; font-size: 11px; font-weight: 800; padding: 4px 10px; color: #0f172a; text-align: center; letter-spacing: 0.5px; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 8px; border: 1px solid #94a3b8; }
    .info-table td { border: 1px solid #cbd5e1; padding: 4px 8px; }
    .info-table td.label { background: #f8fafc; font-weight: 700; color: #334155; width: 13%; white-space: nowrap; }
    .info-table td.val { color: #0f172a; width: 20%; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; border: 1px solid #94a3b8; }
    .items-table th { background: #e2e8f0; border: 1px solid #94a3b8; padding: 5px 4px; font-weight: 800; color: #0f172a; text-align: center; }
    .items-table td { border: 1px solid #cbd5e1; padding: 5px 6px; }
    .total-table { width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #94a3b8; margin-bottom: 8px; }
    .total-table td { border: 1px solid #cbd5e1; padding: 5px 10px; }
    .total-table td.label { background: #f8fafc; font-weight: 800; color: #1e293b; width: 25%; }
    .total-table td.val { font-family: monospace; font-size: 12px; font-weight: 800; text-align: left; }
    .words-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 6px 12px; font-size: 11px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .signatures-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .signatures-table td { width: 50%; border: 1px dashed #cbd5e1; padding: 12px; vertical-align: top; height: 110px; position: relative; }
    .stamp-box { display: inline-block; border: 2px solid #0870d1; border-radius: 50%; width: 85px; height: 85px; color: #0870d1; text-align: center; padding: 14px 4px; font-size: 9px; font-weight: 800; transform: rotate(-10deg); opacity: 0.85; position: absolute; left: 20px; top: 15px; border-style: double; border-width: 4px; }
    .qr-box { width: 75px; height: 75px; border: 1px solid #0f172a; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 9px; text-align: center; background: #ffffff; padding: 4px; }
    .footer-note { font-size: 9.5px; color: #64748b; text-align: justify; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px; }
    .stamp-paid { position: absolute; top: 25mm; left: 15mm; border: 3px solid #16a34a; color: #16a34a; border-radius: 8px; padding: 4px 12px; font-weight: 900; font-size: 14px; transform: rotate(-8deg); background: rgba(240, 253, 244, 0.85); z-index: 10; }
    .stamp-pending { position: absolute; top: 25mm; left: 15mm; border: 3px dashed #d97706; color: #d97706; border-radius: 8px; padding: 4px 12px; font-weight: 900; font-size: 13px; transform: rotate(-8deg); background: rgba(254, 243, 199, 0.85); z-index: 10; }
    @media print { body { background: #ffffff; padding: 0; } .print-actions { display: none !important; } .invoice-wrapper { border: none; box-shadow: none; padding: 0; max-width: 100%; min-height: auto; } }
  </style>
</head>
<body>';

        $html .= '<div class="print-actions">
    <div style="display:flex; align-items:center; gap:12px;">
      <strong style="color:#0870d1; font-size:14px;">صورتحساب الکترونیکی رسمی (سامانه مودیان و دارایی)</strong>
      <span style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:11px; font-family:monospace;">' . htmlspecialchars($d['orderNum']) . '</span>
    </div>
    <div style="display:flex; gap:8px;">
      <a href="/api/invoices/' . ($order['id'] ?? 1) . '/contract" class="btn-outline" target="_blank">مشاهده و چاپ قرارداد رسمی</a>
      <button type="button" class="btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>چاپ و ذخیره PDF رسمی</span>
      </button>
    </div>
  </div>

  <div class="invoice-wrapper">
    ' . $d['statusStamp'] . '
    <table class="header-table">
      <tr>
        <td style="width:20%;">
          <div style="border: 2px solid #0870d1; border-radius: 8px; padding: 6px 12px; display:inline-block; color:#0870d1; font-weight:900; font-size:16px;">KAROVITA</div>
          <div style="font-size:9.5px; color:#475569; margin-top:2px;">سامانه جامع ابری کارویتا</div>
        </td>
        <td style="width:55%;">
          <h1 class="main-title">صورتحساب رسمی فروش کالا و خدمات</h1>
          <div class="sub-title">منطبق با ماده ۱۶۹ قانون مالیات‌های مستقیم و استانداردهای سامانه مودیان کشور</div>
        </td>
        <td style="width:25%; text-align:left;">
          <div class="meta-box">
            <div>شماره فاکتور: <strong style="font-family:monospace;">' . htmlspecialchars($d['orderNum']) . '</strong></div>
            <div>تاریخ صدور: <strong>' . htmlspecialchars($d['dateFa']) . '</strong></div>
            <div>زمان صدور: <strong>' . htmlspecialchars($d['timeFa']) . '</strong></div>
            <div>شناسه مالیاتی: <strong style="font-family:monospace; font-size:9px;">' . htmlspecialchars($d['taxId']) . '</strong></div>
          </div>
        </td>
      </tr>
    </table>

    <div class="section-title">بخش اول: مشخصات فروشنده (ارائه‌دهنده خدمت)</div>
    <table class="info-table">
      <tr>
        <td class="label">نام شخص حقوقی:</td>
        <td class="val" colspan="3"><strong>' . htmlspecialchars($seller['company_name']) . '</strong></td>
        <td class="label">شناسه ملی:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($seller['national_id']) . '</strong></td>
      </tr>
      <tr>
        <td class="label">شماره رهگیری:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($seller['tracking_number'] ?? $seller['economic_code']) . '</strong></td>
        <td class="label">شماره ثبت:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($seller['registration_number']) . '</strong></td>
        <td class="label">کد پستی:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($seller['postal_code']) . '</strong></td>
      </tr>
      <tr>
        <td class="label">استان / شهر:</td>
        <td class="val">' . htmlspecialchars($seller['province'] . ' / ' . $seller['city']) . '</td>
        <td class="label">نشانی کامل:</td>
        <td class="val" colspan="3">' . htmlspecialchars($seller['address']) . '</td>
      </tr>
      <tr>
        <td class="label">تلفن:</td>
        <td class="val" dir="ltr">' . htmlspecialchars($seller['phone']) . '</td>
        <td class="label">پست الکترونیک:</td>
        <td class="val" colspan="3" dir="ltr">' . htmlspecialchars($seller['email']) . '</td>
      </tr>
    </table>

    <div class="section-title">بخش دوم: مشخصات خریدار (مشتری / مشترک)</div>
    <table class="info-table">
      <tr>
        <td class="label">نام خریدار / شرکت:</td>
        <td class="val" colspan="3"><strong>' . htmlspecialchars($d['buyerName']) . '</strong></td>
        <td class="label">شناسه / کد ملی:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($d['buyerNationalId']) . '</strong></td>
      </tr>
      <tr>
        <td class="label">شماره اقتصادی:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($d['buyerEconomicCode']) . '</strong></td>
        <td class="label">شماره ثبت:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($d['buyerRegNo']) . '</strong></td>
        <td class="label">کد پستی:</td>
        <td class="val"><strong style="font-family:monospace;">' . htmlspecialchars($d['buyerPostalCode']) . '</strong></td>
      </tr>
      <tr>
        <td class="label">استان / شهر:</td>
        <td class="val">' . htmlspecialchars($d['buyerLocation']) . '</td>
        <td class="label">نشانی خریدار:</td>
        <td class="val" colspan="3">' . htmlspecialchars($d['buyerAddress']) . '</td>
      </tr>
      <tr>
        <td class="label">شماره تماس / همراه:</td>
        <td class="val" dir="ltr"><strong>' . htmlspecialchars($d['buyerPhone']) . '</strong></td>
        <td class="label">نام رابط / مشترک:</td>
        <td class="val">' . htmlspecialchars($d['buyerName']) . '</td>
        <td class="label">کد رهگیری پرداخت:</td>
        <td class="val"><strong style="font-family:monospace; color:#059669;">' . htmlspecialchars($d['txTracking']) . '</strong></td>
      </tr>
    </table>';

        $html .= '<div class="section-title">بخش سوم: مشخصات کالا یا خدمات مورد معامله</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:4%;">ردیف</th>
          <th style="width:12%;">کد خدمت / کالا</th>
          <th style="width:30%;">شرح خدمات نرم‌افزاری و ماژول‌ها</th>
          <th style="width:5%;">تعداد</th>
          <th style="width:8%;">واحد</th>
          <th style="width:10%;">مبلغ واحد (تومان)</th>
          <th style="width:10%;">مبلغ کل (تومان)</th>
          <th style="width:6%;">تخفیف</th>
          <th style="width:10%;">مبلغ پس از تخفیف</th>
          <th style="width:5%;">نرخ مالیات</th>
          <th style="width:8%;">مالیات و عوارض (۱۰٪)</th>
          <th style="width:12%;">جمع کل با مالیات (تومان)</th>
        </tr>
      </thead>
      <tbody>
        ' . $d['itemRowsHtml'] . '
      </tbody>
    </table>

    <table class="total-table">
      <tr>
        <td class="label">مجموع مبلغ ناخالص:</td>
        <td class="val">' . number_format($d['rawTotal']) . ' تومان</td>
        <td class="label">مجموع تخفیفات اعمال‌شده:</td>
        <td class="val" style="color:#b45309;">' . number_format($d['discountAmount']) . ' تومان</td>
      </tr>
      <tr>
        <td class="label">مبلغ خالص مشمول مالیات (پایه):</td>
        <td class="val">' . number_format($d['baseBeforeVat']) . ' تومان</td>
        <td class="label">مالیات بر ارزش افزوده و عوارض (۱۰٪):</td>
        <td class="val" style="color:#0870d1;">' . number_format($d['vatAmount']) . ' تومان</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td class="label" style="font-size:12px; color:#0870d1;">مبلغ نهایی قابل پرداخت / تسویه‌شده:</td>
        <td class="val" colspan="3" style="font-size:15px; color:#0870d1; font-weight:900;">
          ' . number_format($d['finalAmount']) . ' تومان <span style="font-size:11px; font-weight:normal; color:#64748b;">(معادل ' . number_format($d['finalAmount'] * 10) . ' ریال)</span>
        </td>
      </tr>
    </table>

    <div class="words-box">
      <div><strong>مبلغ کل به حروف:</strong> ' . htmlspecialchars($d['amountInWords']) . '</div>
      <div><strong>نحوه تسویه:</strong> ' . ($d['isPaid'] ? 'پرداخت اینترنتی قطعی شاپرک زیبال (نقدی)' : 'پرداخت الکترونیکی درگاه اینترنتی (معوق)') . '</div>
    </div>

    <table class="signatures-table">
      <tr>
        <td>
          <div style="font-weight:800; font-size:11px; color:#1e293b;">مهر و امضای فروشنده:</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">' . htmlspecialchars($seller['company_name']) . '</div>
          <div class="stamp-box">
            ' . htmlspecialchars($seller['brand_name'] ?: $seller['company_name']) . '<br>
            ' . htmlspecialchars($seller['stamp_title'] ?? 'امور مالی و قراردادها') . '<br>
            ثبت: ' . htmlspecialchars($seller['registration_number']) . '
          </div>
        </td>
        <td>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:800; font-size:11px; color:#1e293b;">مهر و امضای خریدار / کارفرما:</div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">' . htmlspecialchars($d['buyerName']) . '</div>
            </div>
            <div style="text-align:center;">
              <div class="qr-box">QR-TAX<br>' . substr($d['taxId'], 0, 9) . '<br>VALID</div>
              <div style="font-size:8px; color:#64748b; margin-top:2px;">استعلام مودیان</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="footer-note">
      <strong>توضیحات قانونی:</strong> این صورتحساب رسمی مطابق با مفاد ماده ۱۶۹ و ۱۶۹ مکرر قانون مالیات‌های مستقیم، قانون پایانه‌های فروشگاهی و سامانه مودیان کشور تنظیم و صادر گردیده است. مبالغ مندرج بر اساس نرخ مالیات بر ارزش افزوده مصوب سال جاری محاسبه شده و این سند دارای ارزش رسمی، قانونی و قابل استناد جهت ارائه به حوزه مالیاتی، دفاتر حسابرسی و ممیزی دارایی می‌باشد.
    </div>
  </div>
</body>
</html>';

        return $html;
    }
}


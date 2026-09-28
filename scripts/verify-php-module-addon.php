<?php
define('KAROVITA_TEST_MODE', true);
$_SERVER['REQUEST_URI'] = '/__test_internal_skip__';
$_SERVER['REQUEST_METHOD'] = 'GET';

class MockStmt {
    private $data;
    public function __construct($data = []) { $this->data = $data; }
    public function execute($p = []) { return true; }
    public function fetch($m = null) { return is_array($this->data) ? ($this->data[0] ?? false) : false; }
    public function fetchAll($m = null) { return is_array($this->data) ? $this->data : []; }
    public function fetchColumn() { return null; }
}

class MockPDO {
    public $subs = [];
    public function prepare($sql) {
        if (stripos($sql, 'SELECT * FROM subscriptions') !== false) {
            return new MockStmt($this->subs);
        }
        if (stripos($sql, 'UPDATE subscriptions SET') !== false && stripos($sql, 'module_ids') !== false) {
            return new class($this) {
                private $p;
                public function __construct($p) { $this->p = $p; }
                public function execute($params = []) {
                    if (isset($this->p->subs[0])) {
                        if (count($params) >= 12) {
                            $this->p->subs[0]['order_id'] = $params[0];
                            $this->p->subs[0]['module_ids'] = $params[9];
                            $this->p->subs[0]['expires_at'] = $params[10];
                        } else {
                            $this->p->subs[0]['expires_at'] = $params[1];
                            $this->p->subs[0]['module_ids'] = $params[2];
                        }
                    }
                    return true;
                }
            };
        }
        return new MockStmt([]);
    }
    public function query($sql) { return new MockStmt([]); }
    public function exec($sql) { return 1; }
    public function lastInsertId() { return 1; }
}

ob_start();
require_once __DIR__ . '/../backend/index.php';
ob_end_clean();

$pdo = new MockPDO();
$userId = 10;
$initialExpires = '2027-09-14 08:42:28';
$initialModules = ['accounting', 'sales', 'contacts'];

$pdo->subs = [[
    'id' => 1, 'user_id' => $userId, 'order_id' => 1, 'order_number' => 'ORD-001',
    'title' => 'اشتراک اختصاصی ابری', 'package_name' => 'اشتراک اختصاصی ابری',
    'status' => 'active', 'source' => 'purchase', 'billing_period' => 'yearly',
    'user_count' => 1, 'user_limit' => 1, 'price' => 12000000, 'total_price' => 12000000,
    'module_ids' => json_encode($initialModules), 'starts_at' => '2026-09-14 08:42:28',
    'expires_at' => $initialExpires
]];

// Test 1: Addon Module CRM
$addonOrder = [
    'id' => 2, 'user_id' => $userId, 'order_number' => 'ORD-002', 'amount' => 1200000,
    'final_amount' => 1200000, 'module_ids' => json_encode(['crm']), 'user_count' => 1,
    'billing_period' => 'yearly', 'order_type' => 'resource_upgrade', 'is_resource_addon' => 1,
    'subscription_id' => 1
];

createSubscriptionForOrder($pdo, $addonOrder, 'purchase');
$sub = $pdo->subs[0];

assert($sub['expires_at'] === $initialExpires, "FAIL: expires_at changed from $initialExpires to {$sub['expires_at']}");
echo "[PASS] 1. Expiration date remained unchanged: {$sub['expires_at']}\n";

$mods = json_decode($sub['module_ids'], true);
assert(in_array('crm', $mods) && in_array('accounting', $mods), "FAIL: Modules not merged");
echo "[PASS] 2. Modules merged: " . implode(', ', $mods) . "\n";

assert((int)$sub['order_id'] === 1, "FAIL: order_id overwritten");
echo "[PASS] 3. Original order_id (1) preserved\n";

// Test 2: Renewal
$renewOrder = [
    'id' => 3, 'user_id' => $userId, 'order_number' => 'ORD-003', 'amount' => 14000000,
    'final_amount' => 14000000, 'module_ids' => json_encode($mods), 'user_count' => 1,
    'billing_period' => 'yearly', 'order_type' => 'renewal', 'is_renewal' => 1,
    'subscription_id' => 1
];

createSubscriptionForOrder($pdo, $renewOrder, 'purchase');
$subRenew = $pdo->subs[0];
$expectedRenew = strtotime($initialExpires) + (365 * 86400);
assert(abs(strtotime($subRenew['expires_at']) - $expectedRenew) <= 1, "FAIL: Renewal did not extend");
echo "[PASS] 4. Renewal extended expires_at to: {$subRenew['expires_at']}\n";

echo "\nALL PHP ADDON TESTS PASSED!\n";


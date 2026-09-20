import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/db.ts';

describe('ERP Subscription Module Addon - Strict Expiration Date Invariance', () => {
  const TEST_USER_ID = 9991;
  const INITIAL_EXPIRES_AT = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  beforeEach(() => {
    db.subscriptions = db.subscriptions.filter(s => s.user_id !== TEST_USER_ID);
    db.orders = db.orders.filter(o => o.user_id !== TEST_USER_ID);
  });

  it('خرید ماژول جدید و افزودن آن به اشتراک فعال نباید تاریخ انقضای اشتراک را افزایش دهد', () => {
    const initialSub = db.createERPSubscription(
      TEST_USER_ID,
      null,
      ['account', 'contacts'],
      2,
      'yearly',
      'purchase'
    );
    initialSub.expires_at = INITIAL_EXPIRES_AT;
    db.save();

    const originalExpiryTime = new Date(initialSub.expires_at).getTime();

    // صدور سفارش افزودن ماژول جدید (crm) به عنوان addon
    const addonOrder = db.createResourceAddonOrder(
      TEST_USER_ID,
      initialSub.id,
      ['account', 'contacts', 'crm'],
      2
    );

    assert.equal(addonOrder.is_resource_addon, true);
    assert.equal(addonOrder.order_type, 'resource_upgrade');
    assert.deepEqual(addonOrder.module_ids, ['crm']);

    // تسویه و فعال‌سازی سفارش ماژول جدید
    addonOrder.status = 'paid';
    const updatedSub = db.activateOrMergeERPSubscription(
      TEST_USER_ID,
      addonOrder.id,
      addonOrder.module_ids || [],
      addonOrder.user_count || 2,
      addonOrder.billing_period || 'yearly',
      'purchase',
      addonOrder.subscription_id,
      true
    );

    // اعتبارسنجی: تاریخ انقضا باید بدون تغییر بماند
    assert.equal(
      updatedSub.expires_at,
      INITIAL_EXPIRES_AT,
      'تاریخ انقضای اشتراک پس از خرید ماژول جدید نباید افزایش یابد'
    );
    assert.equal(new Date(updatedSub.expires_at).getTime(), originalExpiryTime);

    // ماژول‌های اشتراک باید ماژول قبلی + ماژول جدید را شامل شوند
    assert.ok(updatedSub.module_ids.includes('account'));
    assert.ok(updatedSub.module_ids.includes('contacts'));
    assert.ok(updatedSub.module_ids.includes('crm'));
    assert.equal(updatedSub.module_ids.length, 3);
    assert.equal(updatedSub.billing_period, 'yearly');
  });

  it('افزودن چند ماژول متوالی در دوره‌های زمانی مختلف نباید انقضا را جابجا کند', () => {
    const initialSub = db.createERPSubscription(
      TEST_USER_ID,
      null,
      ['account'],
      1,
      'yearly',
      'purchase'
    );
    initialSub.expires_at = INITIAL_EXPIRES_AT;
    db.save();

    // خرید اول: افزودن sale
    const order1 = db.createResourceAddonOrder(TEST_USER_ID, initialSub.id, ['account', 'sale']);
    order1.status = 'paid';
    const subAfter1 = db.activateOrMergeERPSubscription(
      TEST_USER_ID,
      order1.id,
      order1.module_ids || [],
      1,
      'yearly',
      'purchase',
      initialSub.id,
      true
    );
    assert.equal(subAfter1.expires_at, INITIAL_EXPIRES_AT);
    assert.deepEqual(subAfter1.module_ids.sort(), ['account', 'sale'].sort());

    // خرید دوم: افزودن crm
    const order2 = db.createResourceAddonOrder(TEST_USER_ID, initialSub.id, ['account', 'sale', 'crm']);
    order2.status = 'paid';
    const subAfter2 = db.activateOrMergeERPSubscription(
      TEST_USER_ID,
      order2.id,
      order2.module_ids || [],
      1,
      'yearly',
      'purchase',
      initialSub.id,
      true
    );
    assert.equal(subAfter2.expires_at, INITIAL_EXPIRES_AT);
    assert.deepEqual(subAfter2.module_ids.sort(), ['account', 'crm', 'sale'].sort());
  });

  it('حتی اگر پرچم isResourceUpgrade پاس داده نشود، انقضا نباید زیاد شود', () => {
    const initialSub = db.createERPSubscription(
      TEST_USER_ID,
      null,
      ['account', 'hr'],
      1,
      'yearly',
      'purchase'
    );
    initialSub.expires_at = INITIAL_EXPIRES_AT;
    db.save();

    const customOrder = {
      id: 88888,
      user_id: TEST_USER_ID,
      order_number: 'ORD-TEST-88888',
      amount: 500000,
      status: 'paid',
      subscription_id: initialSub.id,
      module_ids: ['inventory'],
      order_type: 'addon',
      is_resource_addon: true,
      created_at: new Date().toISOString()
    };
    db.orders.push(customOrder);

    const updatedSub = db.activateOrMergeERPSubscription(
      TEST_USER_ID,
      customOrder.id,
      ['inventory'],
      1,
      'yearly',
      'purchase',
      initialSub.id
    );

    assert.equal(updatedSub.expires_at, INITIAL_EXPIRES_AT);
    assert.ok(updatedSub.module_ids.includes('inventory'));
    assert.ok(updatedSub.module_ids.includes('account'));
    assert.ok(updatedSub.module_ids.includes('hr'));
  });

  it('در زمان تمدید رسمی اشتراک (renewal)، تاریخ انقضا باید به درستی افزایش یابد', () => {
    const initialSub = db.createERPSubscription(
      TEST_USER_ID,
      null,
      ['account', 'crm'],
      1,
      'yearly',
      'purchase'
    );
    initialSub.expires_at = INITIAL_EXPIRES_AT;
    db.save();

    const originalExpiryMs = new Date(INITIAL_EXPIRES_AT).getTime();

    const renewalOrder = {
      id: 99999,
      user_id: TEST_USER_ID,
      order_number: 'ORD-TEST-RENEW-99999',
      amount: 12000000,
      status: 'paid',
      subscription_id: initialSub.id,
      module_ids: ['account', 'crm'],
      order_type: 'renewal',
      is_renewal: true,
      billing_period: 'yearly',
      created_at: new Date().toISOString()
    };
    db.orders.push(renewalOrder);

    const renewedSub = db.activateOrMergeERPSubscription(
      TEST_USER_ID,
      renewalOrder.id,
      ['account', 'crm'],
      1,
      'yearly',
      'purchase',
      initialSub.id,
      false
    );

    const renewedExpiryMs = new Date(renewedSub.expires_at).getTime();
    const expectedAddedMs = 365 * 24 * 60 * 60 * 1000;

    assert.ok(
      renewedExpiryMs >= originalExpiryMs + expectedAddedMs - 2000 &&
      renewedExpiryMs <= originalExpiryMs + expectedAddedMs + 2000,
      'در زمان تمدید رسمی، دوره جدید به تاریخ انقضا افزوده می‌شود'
    );
});

  });


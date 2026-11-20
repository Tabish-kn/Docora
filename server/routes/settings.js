const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

const PLANS = {
  free: {
    id: 'free',
    name: 'Starter Workspace',
    priceMonthly: 0,
    priceYearly: 0,
    storageLimitGB: 2,
    memberLimit: 3,
    aiCredits: 50,
    features: ['Up to 3 members', '2 GB cloud storage', 'Standard rich document editor', 'Community support'],
  },
  pro: {
    id: 'pro',
    name: 'Pro Collaborator',
    priceMonthly: 12,
    priceYearly: 120,
    storageLimitGB: 20,
    memberLimit: 15,
    aiCredits: 500,
    features: ['Up to 15 members', '20 GB cloud storage', 'Full AI writing & chat suite', 'Version history rollback', 'Priority 24/7 support', 'Custom domain & branding'],
  },
  business: {
    id: 'business',
    name: 'Enterprise Business',
    priceMonthly: 39,
    priceYearly: 390,
    storageLimitGB: 100,
    memberLimit: 100,
    aiCredits: 2500,
    features: ['Unlimited members', '100 GB cloud storage', 'Unlimited AI assistance', 'SAML SSO & Advanced RBAC', 'Dedicated Customer Success Manager', '99.9% Uptime SLA', 'Audit trail logs'],
  },
};

// Get settings and subscription overview
router.get('/billing', async (req, res) => {
  try {
    const ws = await dataService.getWorkspace('ws_default');
    const currentPlanId = ws?.plan || 'pro';
    const currentPlan = PLANS[currentPlanId] || PLANS.pro;

    const invoices = [
      {
        id: 'inv_2026_11',
        date: '2026-11-01',
        amount: '$12.00',
        plan: 'Pro Collaborator (Monthly)',
        status: 'Paid',
        pdfUrl: '#',
      },
      {
        id: 'inv_2026_10',
        date: '2026-10-01',
        amount: '$12.00',
        plan: 'Pro Collaborator (Monthly)',
        status: 'Paid',
        pdfUrl: '#',
      },
      {
        id: 'inv_2026_09',
        date: '2026-09-01',
        amount: '$12.00',
        plan: 'Pro Collaborator (Monthly)',
        status: 'Paid',
        pdfUrl: '#',
      },
    ];

    res.json({
      currentPlan,
      plans: PLANS,
      billingCycle: 'monthly',
      storageUsedGB: 4.5,
      storageTotalGB: currentPlan.storageLimitGB,
      aiUsedCredits: 142,
      aiTotalCredits: currentPlan.aiCredits,
      membersCount: ws?.members?.length || 4,
      membersLimit: currentPlan.memberLimit,
      invoices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update subscription plan
router.post('/billing/plan', async (req, res) => {
  try {
    const { planId } = req.body;
    if (!PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const plan = PLANS[planId];
    await dataService.updateWorkspace('ws_default', {
      plan: planId,
      storageLimitBytes: plan.storageLimitGB * 1024 * 1024 * 1024,
    });

    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

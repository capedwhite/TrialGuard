const express = require('express');
const router = express.Router();
const zod = require('zod');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');

// ── Zod schemas ───────────────────────────────────────────────────
const createSubscriptionSchema = zod.object({
  service_name: zod.string().min(1, { message: 'Service name is required' }),
  trial_start: zod.string().date({ message: 'Invalid date format' }),
  trial_end: zod.string().date({ message: 'Invalid date format' }),
  price_after_trial: zod.number().nonnegative().optional(),
});

const updateSubscriptionSchema = zod.object({
  service_name: zod.string().min(1).optional(),
  trial_start: zod.string().date().optional(),
  trial_end: zod.string().date().optional(),
  price_after_trial: zod.number().nonnegative().optional(),
  status: zod.enum(['active', 'cancelled', 'expired']).optional(),
});

// ── Routes ────────────────────────────────────────────────────────
// authMiddleware on every route — no unauthenticated access to subscriptions.
// router.use() applies it once to all routes below instead of
// adding it individually to each route.
router.use(authMiddleware);

router.get('/', getSubscriptions);
router.post('/', validate(createSubscriptionSchema), createSubscription);
router.put('/:id', validate(updateSubscriptionSchema), updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
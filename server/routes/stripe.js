const express  = require('express');
const Stripe   = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function serviceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// POST /api/stripe/checkout — create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = serviceClient();
  const { data: dbUser } = await sb.from('users').select('stripe_customer_id').eq('id', req.user.id).single();

  let customerId = dbUser?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email, metadata: { supabase_user_id: req.user.id }
    });
    customerId = customer.id;
    await sb.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/billing?upgraded=true`,
    cancel_url:  `${process.env.FRONTEND_URL}/billing`,
    metadata: { supabase_user_id: req.user.id, plan: 'pro' },
    allow_promotion_codes: true,
  });

  res.json({ url: session.url });
});

// GET /api/stripe/portal — open billing portal
router.get('/portal', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = serviceClient();
  const { data: dbUser } = await sb.from('users').select('stripe_customer_id').eq('id', req.user.id).single();
  if (!dbUser?.stripe_customer_id) return res.status(404).json({ error: 'No billing account' });

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/billing`,
  });
  res.json({ url: session.url });
});

// POST /api/stripe/webhook — handle Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const sb = serviceClient();

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    if (s.metadata?.supabase_user_id) {
      await sb.from('users').update({
        plan: s.metadata.plan ?? 'pro',
        stripe_subscription_id: s.subscription,
      }).eq('id', s.metadata.supabase_user_id);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const s = event.data.object;
    if (s.metadata?.supabase_user_id) {
      await sb.from('users').update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', s.metadata.supabase_user_id);
    }
  }

  res.json({ received: true });
});

module.exports = router;

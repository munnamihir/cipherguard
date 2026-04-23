require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:4200', process.env.FRONTEND_URL ?? ''].filter(Boolean) }));

// Stripe webhook must get raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Auth middleware — reads Supabase JWT
const { createClient } = require('@supabase/supabase-js');
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user } } = await sb.auth.getUser(token);
    req.user = user;
    req.supabase = sb;
  } catch {}
  next();
});

app.use('/api/stripe', require('./routes/stripe'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'CipherGuard API' }));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`⬡ CipherGuard API → http://localhost:${PORT}`));

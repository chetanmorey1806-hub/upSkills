export default {
  id: 'day-10-payments-razorpay-and-transactional-emails',
  title: 'Payments with Razorpay (Orders, Checkout, Signature Verification, Webhooks) + Transactional Emails (Nodemailer / Resend)',
  module: 'Module 3: Real Features',
  day: 10,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Add real online payments to a MERN shop with Razorpay: the server calculates the amount and creates an order, React opens Razorpay Checkout, the server verifies the HMAC signature, and an idempotent webhook marks the order paid even if the browser closes. Then send order-confirmation emails with Nodemailer or Resend without slowing down or breaking checkout.',
  objectives: [
    'Explain the full Razorpay payment flow and which steps must happen on the server',
    'Create Razorpay orders with amounts calculated from the database (in paise), never from the client',
    'Integrate Razorpay Checkout in React and verify the payment signature on the server with HMAC SHA256',
    'Build an idempotent webhook handler using the raw body and the X-Razorpay-Signature header',
    'Send transactional emails (order confirmation, password reset) with Nodemailer or Resend, asynchronously and reliably',
  ],
  theory: [
    {
      heading: 'The payment flow, step by step',
      content:
        "Razorpay is the most used payment gateway for Indian startups (UPI, cards, net banking, wallets, EMI). The flow has **three actors**: your React app, your Express API and Razorpay.\n\n1. **Cart → Order (your DB)**: user clicks \"Pay\". React calls `POST /api/orders/checkout` with only the cart item ids and quantities.\n2. **Server calculates the price** from MongoDB (prices, discounts, coupon, GST, delivery), creates your own `Order` document with status `pending`, then calls `razorpay.orders.create({ amount, currency: 'INR', receipt })`. The amount is in **paise** (₹1,499.00 = `149900`). It saves `razorpayOrderId` on your order and returns `{ orderId, razorpayOrderId, amount, currency, keyId }`.\n3. **React opens Razorpay Checkout** (a popup from `checkout.razorpay.com/v1/checkout.js`) with `order_id` and the public `key_id`. The user pays with UPI/card.\n4. On success Checkout calls your `handler` with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`.\n5. **React sends these three values to `POST /api/payments/verify`**. The server recomputes `HMAC_SHA256(order_id + '|' + payment_id, key_secret)` and compares. If it matches, mark the order **paid**, reduce stock, clear the cart, queue the confirmation email.\n6. **Webhook (backup and source of truth)**: Razorpay also calls `POST /api/webhooks/razorpay` server-to-server with events like `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`. This updates the order even if the user closed the browser after paying.\n\nAnalogy: the browser is a **customer carrying a receipt**. You do not believe a receipt just because the customer shows it; you check the bank's stamp (signature). The webhook is the **bank calling you directly**.",
      tip: "Golden rule: the browser can only START a payment and REPORT a result. Prices, order creation, verification and fulfilment happen on the server.",
    },
    {
      heading: 'Creating orders safely on the server',
      content:
        "Common beginner bug: React sends `{ amount: 1499 }` and the server passes it to Razorpay. An attacker edits the request to `{ amount: 1 }` and buys a phone for ₹1. Always:\n\n- Accept only **product ids and quantities** (and a coupon code) from the client.\n- Load prices from MongoDB, check stock, apply discounts on the server.\n- Convert to paise with integer maths: `Math.round(total * 100)` (or store prices in paise from the start, which avoids floating point issues).\n- Save your own `Order` first (status `pending`, items with **price snapshot**, totals, address) so that later price changes do not affect this order.\n- `receipt` is your reference (max 40 characters), e.g. your order `_id`.\n- Store `razorpayOrderId` on your order; verification and webhooks use it to find the order.\n\nSecrets: `RAZORPAY_KEY_ID` (public, `rzp_test_...` / `rzp_live_...`) and `RAZORPAY_KEY_SECRET` (server only). Use **test mode** keys while developing; Razorpay provides test cards and test UPI ids (e.g. `success@razorpay`).",
      syntax: `// server/src/config/razorpay.js
import Razorpay from 'razorpay';
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// in the checkout controller
const rzpOrder = await razorpay.orders.create({
  amount: order.totalPaise,        // integer, paise
  currency: 'INR',
  receipt: String(order._id),      // <= 40 chars
  notes: { userId: String(req.user.id) },
});
order.razorpayOrderId = rzpOrder.id;   // "order_XXXXXXXXXXXXXX"
await order.save();`,
    },
    {
      heading: 'Signature verification with HMAC',
      content:
        "When Checkout succeeds, the browser receives three strings. Anyone can fake JSON in DevTools, so the server verifies the **signature**:\n\n`expected = HMAC_SHA256(razorpay_order_id + \"|\" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` as hex.\n\nIf `expected === razorpay_signature`, Razorpay really produced this payment for this order (only Razorpay and you know the secret). Compare with `crypto.timingSafeEqual` to avoid timing attacks.\n\nImportant details:\n\n- Use the `razorpay_order_id` **from your database** (the one saved on the user's order), not only the one from the request. Otherwise a user could reuse a valid payment from a cheap order to \"pay\" for an expensive one.\n- The order must belong to `req.user` and still be `pending` (idempotency: verifying twice should not reduce stock twice).\n- The Razorpay Node SDK also has a helper: `validatePaymentVerification({ order_id, payment_id }, signature, secret)` from `razorpay/dist/utils/razorpay-utils`.\n- Payments can be **authorized but not captured** if auto-capture is off. Enable automatic capture in the dashboard (default for most accounts) or capture via API; uncaptured payments are refunded automatically after a few days.",
    },
    {
      heading: 'Webhooks: the reliable source of truth',
      content:
        "The browser step can fail: the user closes the tab, the network drops, the phone switches to the UPI app and never returns. The **webhook** guarantees you still learn about the payment.\n\nSetup in the Razorpay dashboard: Settings → Webhooks → URL `https://api.yourshop.in/api/webhooks/razorpay`, a **webhook secret**, and events (`payment.captured`, `payment.failed`, `order.paid`, `refund.processed`).\n\nRules for a correct handler:\n\n1. **Verify the signature using the RAW body**: `HMAC_SHA256(rawBody, WEBHOOK_SECRET)` must equal the `X-Razorpay-Signature` header. If `express.json()` parsed the body first and you re-stringify it, spacing/key order can differ and the check fails. Mount `express.raw({ type: 'application/json' })` on the webhook route **before** the global `express.json()`.\n2. **Respond 2xx quickly** (within a few seconds). Do heavy work (emails, invoices) in a queue. Non-2xx responses are retried by Razorpay.\n3. **Be idempotent**: the same event can arrive more than once and in any order. Store processed event ids (`x-razorpay-event-id` header) with a unique index, and use conditional updates such as `Order.updateOne({ _id, status: 'pending' }, { status: 'paid' })` so a second delivery changes nothing.\n4. Both `/verify` and the webhook may mark the same order paid; that is fine if both are idempotent.\n5. **Local testing**: expose your local server with a tunnel (ngrok, cloudflared) and use test mode.",
      syntax: `// server/src/app.js - order matters!
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);
app.use(express.json({ limit: '10kb' }));   // all other routes`,
    },
    {
      heading: 'Order states, stock and refunds',
      content:
        "Model the order as a **state machine** so bugs are visible:\n\n`pending` → `paid` → `shipped` → `delivered`, with side branches `failed`, `cancelled`, `refunded`.\n\n- Only allow valid transitions (`paid` cannot go back to `pending`).\n- **Stock**: reserve or decrement stock when the order is paid, with an atomic conditional update: `Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. If it returns `modifiedCount: 0`, the item sold out; refund automatically and tell the user.\n- Use a **MongoDB transaction** (`session.withTransaction`) when you update the order, several products and the cart together (needs a replica set; Atlas always is one).\n- **Abandoned orders**: a cron job marks `pending` orders older than 30 minutes as `expired` and releases reserved stock.\n- **Refunds**: `razorpay.payments.refund(paymentId, { amount })` (amount in paise; omit for full refund). Update your order when the `refund.processed` webhook arrives.\n- Never store card numbers or UPI PINs. Razorpay handles PCI-DSS compliance; you store only ids (`pay_...`, `order_...`).",
    },
    {
      heading: 'Transactional emails: Nodemailer vs Resend',
      content:
        "**Transactional emails** are triggered by user actions: welcome, email verification, password reset OTP, order confirmation, shipping update, invoice. (Marketing newsletters are different and need unsubscribe handling.)\n\nTwo common choices:\n\n- **Nodemailer**: the classic Node library. You give it an SMTP server (Amazon SES, Brevo, Mailgun, Zoho, or Gmail with an App Password for small tests). Free and flexible, but deliverability depends on your SMTP provider.\n- **Resend**: a modern email API with a tiny SDK (`resend.emails.send({ from, to, subject, html })`), good developer experience and first-class support for **React Email** templates (write emails as React components). Free tier is enough for side projects.\n\nProduction checklist:\n\n1. **Verify your sending domain** and set **SPF, DKIM and DMARC** DNS records, otherwise mails go to spam. Send from `orders@mail.yourshop.in`, not a Gmail address.\n2. **Do not block the HTTP response** waiting for email. Put a job in a queue (BullMQ + Redis) with retries, or at least fire-and-forget with error logging. A failed email must never fail a successful payment.\n3. **Idempotency**: store `confirmationEmailSentAt` on the order so webhook retries do not send three emails.\n4. **Escape user data** in HTML templates (names, addresses) to avoid HTML injection; React Email does this automatically.\n5. In development use **Ethereal** (fake SMTP from Nodemailer) or Mailpit to see emails without sending them.",
      syntax: `// Resend
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const { data, error } = await resend.emails.send({
  from: 'ShopKart <orders@mail.shopkart.in>',
  to: [user.email],
  subject: 'Order #' + order.number + ' confirmed',
  html: renderedHtml,
});
if (error) throw new Error(error.message);

// Nodemailer (SMTP)
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: 587, secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transporter.sendMail({ from: '"ShopKart" <orders@mail.shopkart.in>', to: user.email, subject, html, text });`,
    },
  ],
  examples: [
    {
      title: 'Checkout endpoint: price calculated on the server, amount in paise (API Lab)',
      scenario: 'React sends cart items. The server must ignore any price or amount sent by the client, check stock, compute totals with GST and delivery, and return what Checkout needs.',
      steps: [
        'Validate the items array (ids + integer quantities)',
        'Load each product from the "database" and check stock',
        'Compute subtotal, 18% GST and delivery (free above Rs 999) in paise',
        'Create a pending order and a (fake) Razorpay order id',
        'Send a normal request, one with a fake low amount, and one with too much quantity',
      ],
      code: `// server/src/controllers/checkout.js (real version)
import { razorpay } from '../config/razorpay.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export async function checkout(req, res) {
  const items = checkoutSchema.parse(req.body).items;          // [{ productId, qty }]
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw new HttpError(400, 'Product not found');
    if (p.stock < i.qty) throw new HttpError(409, p.name + ' has only ' + p.stock + ' left');
    return { product: p._id, name: p.name, pricePaise: p.pricePaise, qty: i.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.pricePaise * l.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal >= 99900 ? 0 : 4900;
  const totalPaise = subtotal + gst + delivery;

  const order = await Order.create({ user: req.user.id, items: lines, subtotal, gst, delivery, totalPaise, status: 'pending' });
  const rzp = await razorpay.orders.create({ amount: totalPaise, currency: 'INR', receipt: String(order._id) });
  order.razorpayOrderId = rzp.id;
  await order.save();

  res.status(201).json({
    orderId: order._id, razorpayOrderId: rzp.id, amount: totalPaise, currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// prices stored in paise (integers) to avoid floating point errors
const products = {
  p1: { name: 'Wireless Earbuds', pricePaise: 149900, stock: 10 },
  p2: { name: 'USB-C Cable', pricePaise: 29900, stock: 2 },
};
const orders = [];

app.post('/api/orders/checkout', (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const lines = [];
  for (const i of items) {
    const p = products[i.productId];
    if (!p) return res.status(400).json({ message: 'Unknown product ' + i.productId });
    if (!Number.isInteger(i.qty) || i.qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
    if (p.stock < i.qty) return res.status(409).json({ message: p.name + ' has only ' + p.stock + ' left' });
    lines.push({ productId: i.productId, name: p.name, pricePaise: p.pricePaise, qty: i.qty });
  }
  // NOTE: req.body.amount is ignored completely
  const subtotal = lines.reduce((s, l) => s + l.pricePaise * l.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal >= 99900 ? 0 : 4900;
  const totalPaise = subtotal + gst + delivery;

  const order = { id: 'ord_' + (orders.length + 1), status: 'pending', lines, subtotal, gst, delivery, totalPaise };
  order.razorpayOrderId = 'order_DEMO' + (orders.length + 1); // real: (await razorpay.orders.create(...)).id
  orders.push(order);

  res.status(201).json({
    orderId: order.id,
    razorpayOrderId: order.razorpayOrderId,
    amount: totalPaise,
    currency: 'INR',
    display: 'Rs ' + (totalPaise / 100).toFixed(2),
    breakup: { subtotal, gst, delivery },
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/orders/checkout', body: { items: [{ productId: 'p1', qty: 1 }] } },
          { method: 'POST', url: '/api/orders/checkout', body: { items: [{ productId: 'p2', qty: 1 }], amount: 1 } },
          { method: 'POST', url: '/api/orders/checkout', body: { items: [{ productId: 'p2', qty: 5 }] } },
          { method: 'POST', url: '/api/orders/checkout', body: { items: [] } },
        ],
      },
      result: "POST /api/orders/checkout → 201 {\"orderId\":\"ord_1\",\"razorpayOrderId\":\"order_DEMO1\",\"amount\":176882,\"currency\":\"INR\",\"display\":\"Rs 1768.82\",\"breakup\":{\"subtotal\":149900,\"gst\":26982,\"delivery\":0}}\nPOST /api/orders/checkout → 201 {\"orderId\":\"ord_2\",\"razorpayOrderId\":\"order_DEMO2\",\"amount\":40182,\"currency\":\"INR\",\"display\":\"Rs 401.82\",\"breakup\":{\"subtotal\":29900,\"gst\":5382,\"delivery\":4900}}\nPOST /api/orders/checkout → 409 {\"message\":\"USB-C Cable has only 2 left\"}\nPOST /api/orders/checkout → 400 {\"message\":\"Cart is empty\"}",
      explanation:
        "Request 1: Rs 1,499 earbuds → subtotal 149900 paise, GST 26982, free delivery (above Rs 999), total 176882 paise = Rs 1768.82. Request 2 tries to sneak amount: 1, but the server never reads it: the cable costs 29900 + 5382 GST + 4900 delivery = 40182 paise. Request 3 asks for 5 cables when only 2 are in stock → 409 Conflict. Request 4 has an empty cart → 400. Everything is integer paise, which is exactly what razorpay.orders.create expects for amount.",
    },
    {
      title: 'Verifying the payment signature and the webhook signature (real Node crypto)',
      scenario: 'Prove to yourself how Razorpay signatures work: a real signature passes, a tampered payment id fails, and a webhook verified against a re-stringified body fails.',
      steps: [
        'Create verify-signature.js with the code below',
        'Run node verify-signature.js',
        'Observe that only the exact order_id|payment_id combination passes',
        'Observe that the webhook check must use the raw body bytes',
      ],
      code: `// verify-signature.js  -> run: node verify-signature.js
const crypto = require('node:crypto');

const KEY_SECRET = 'test_key_secret_123';          // process.env.RAZORPAY_KEY_SECRET
const WEBHOOK_SECRET = 'whsec_demo_456';           // process.env.RAZORPAY_WEBHOOK_SECRET

function safeEqualHex(a, b) {
  const x = Buffer.from(String(a), 'utf8');
  const y = Buffer.from(String(b), 'utf8');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// 1) Checkout success callback: signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
  return safeEqualHex(expected, razorpay_signature);
}

// 2) Webhook: signature = HMAC_SHA256(raw request body, webhook_secret)
function verifyWebhook(rawBody, signatureHeader) {
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  return safeEqualHex(expected, signatureHeader);
}

// --- demo ---
const orderId = 'order_Pz8kQ1abcXYZ12';
const paymentId = 'pay_Pz8lR2defUVW34';
const goodSig = crypto.createHmac('sha256', KEY_SECRET).update(orderId + '|' + paymentId).digest('hex');

console.log('real signature   :', verifyPaymentSignature({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: goodSig }));
console.log('tampered payment :', verifyPaymentSignature({ razorpay_order_id: orderId, razorpay_payment_id: 'pay_FAKE000', razorpay_signature: goodSig }));
console.log('random signature :', verifyPaymentSignature({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: 'abc123' }));

const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: paymentId, order_id: orderId, amount: 149900 } } } });
const webhookSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
console.log('webhook raw body :', verifyWebhook(raw, webhookSig));
console.log('webhook re-stringified with spaces:', verifyWebhook(JSON.stringify(JSON.parse(raw), null, 2), webhookSig));`,
      result: `real signature   : true
tampered payment : false
random signature : false
webhook raw body : true
webhook re-stringified with spaces: false`,
      explanation:
        "HMAC mixes the message with a secret key; without the secret nobody can produce a matching signature, and changing even one character of the payment id gives a completely different hash. timingSafeEqual compares in constant time (and we check lengths first, because it throws on different lengths). The last line is the classic webhook bug: if you parse the body with express.json() and then JSON.stringify it again, the bytes differ from what Razorpay signed, so verification fails. Always use express.raw() for the webhook route.",
    },
    {
      title: 'React checkout button with Razorpay Checkout (flow simulated in the playground)',
      scenario: 'Build a "Pay now" button that creates the order, opens Checkout, verifies on the server and handles cancel/failure. The playground cannot load the real Razorpay script, so a fake Checkout imitates its callbacks.',
      steps: [
        'Load https://checkout.razorpay.com/v1/checkout.js once (helper loadScript)',
        'Call POST /api/orders/checkout to get razorpayOrderId, amount and keyId',
        'Open new window.Razorpay(options) with order_id, handler and modal.ondismiss',
        'In handler, POST the three razorpay_* values to /api/payments/verify',
        'Click Run and try Pay (success), Cancel and Fail in the fake popup',
      ],
      code: `// client/src/features/checkout/PayButton.jsx (real app)
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PayButton({ cartItems, user }) {
  const [status, setStatus] = useState('idle'); // idle | creating | paying | verifying | error
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function pay() {
    setError('');
    setStatus('creating');
    if (!(await loadRazorpay())) { setStatus('error'); return setError('Could not load payment gateway'); }
    try {
      const { data } = await api.post('/orders/checkout', {
        items: cartItems.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      setStatus('paying');
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: 'ShopKart',
        description: 'Order ' + data.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          setStatus('verifying');
          try {
            await api.post('/payments/verify', { orderId: data.orderId, ...response });
            qc.invalidateQueries({ queryKey: ['cart'] });
            navigate('/orders/' + data.orderId + '?success=1');
          } catch {
            setStatus('error');
            setError('Payment received but verification failed. Do not pay again; we will confirm by email.');
          }
        },
        modal: { ondismiss: () => setStatus('idle') },
      });
      rzp.on('payment.failed', (resp) => { setStatus('error'); setError(resp.error.description); });
      rzp.open();
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Could not start payment');
    }
  }

  return (
    <>
      <button onClick={pay} disabled={status !== 'idle' && status !== 'error'}>
        {status === 'creating' ? 'Creating order...' : status === 'verifying' ? 'Confirming...' : 'Pay now'}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

// ---- fakes for the playground (real app: axios + checkout.razorpay.com script) ----
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const fakeApi = {
  async checkout(items) { await wait(500); return { orderId: 'ord_1', razorpayOrderId: 'order_DEMO1', amount: 176882, currency: 'INR', keyId: 'rzp_test_xxx' }; },
  async verify(body) { await wait(500); if (!body.razorpay_signature) throw new Error('bad'); return { ok: true }; },
};
function FakeRazorpay(options) {
  const handlers = {};
  return {
    on: (e, fn) => { handlers[e] = fn; },
    open: () => window.__openFake({ options, handlers }),
  };
}

function App() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [popup, setPopup] = useState(null);
  window.__openFake = setPopup;

  async function pay() {
    setMessage('');
    setStatus('creating');
    const data = await fakeApi.checkout([{ productId: 'p1', qty: 1 }]);
    console.log('order created', data.razorpayOrderId, 'amount', data.amount);
    setStatus('paying');
    const rzp = FakeRazorpay({
      key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.razorpayOrderId, name: 'ShopKart',
      handler: async (response) => {
        setStatus('verifying');
        try {
          await fakeApi.verify({ orderId: data.orderId, ...response });
          setStatus('success');
          setMessage('Payment verified for ' + data.orderId + '. Confirmation email queued.');
        } catch { setStatus('error'); setMessage('Verification failed'); }
      },
      modal: { ondismiss: () => { setStatus('idle'); setMessage('Payment cancelled. Your cart is safe.'); } },
    });
    rzp.on('payment.failed', (resp) => { setStatus('error'); setMessage(resp.error.description); });
    rzp.open();
  }

  function popupAction(kind) {
    const { options, handlers } = popup;
    setPopup(null);
    if (kind === 'pay') options.handler({ razorpay_payment_id: 'pay_DEMO9', razorpay_order_id: options.order_id, razorpay_signature: 'hex-signature-from-razorpay' });
    if (kind === 'cancel') options.modal.ondismiss();
    if (kind === 'fail') handlers['payment.failed']({ error: { description: 'Your bank declined the payment. Try UPI or another card.' } });
  }

  const label = { idle: 'Pay Rs 1768.82', creating: 'Creating order...', paying: 'Waiting for payment...', verifying: 'Confirming...', success: 'Paid', error: 'Try again' }[status];
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h3>Wireless Earbuds x 1</h3>
      <button onClick={pay} disabled={['creating', 'paying', 'verifying', 'success'].includes(status)}>{label}</button>
      {message && <p style={{ color: status === 'success' ? 'green' : status === 'error' ? 'crimson' : '#444' }}>{message}</p>}
      {popup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, width: 260 }}>
            <b>Fake Razorpay Checkout</b>
            <p>{popup.options.name} - Rs {(popup.options.amount / 100).toFixed(2)}<br /><small>{popup.options.order_id}</small></p>
            <button onClick={() => popupAction('pay')}>Pay (UPI success)</button>{' '}
            <button onClick={() => popupAction('fail')}>Fail</button>{' '}
            <button onClick={() => popupAction('cancel')}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}`,
      },
      result: 'Clicking "Pay Rs 1768.82" shows "Creating order...", logs order created order_DEMO1 amount 176882, then opens the fake Checkout popup. "Pay" shows "Confirming..." and then the green success message; "Fail" shows the bank decline message in red; "Close" returns to the Pay button with "Payment cancelled. Your cart is safe."',
      explanation:
        "The component is a small state machine (idle → creating → paying → verifying → success/error) so the button cannot be double-clicked into two payments. The fake popup calls the same three hooks the real Razorpay Checkout uses: handler on success (with razorpay_payment_id, razorpay_order_id, razorpay_signature), the payment.failed event, and modal.ondismiss on close. A success in the browser is only a claim; the order is marked paid after the server verifies the signature (and the webhook confirms it).",
    },
    {
      title: 'Idempotent webhook handler: duplicate events and order state (API Lab)',
      scenario: 'Razorpay retries webhooks and may deliver the same event twice. Make sure stock is reduced and the email is queued only once. (The API Lab has no HMAC, so the signature check is a clearly marked stub; the real check is shown in the code section.)',
      steps: [
        'Reject requests whose signature check fails (401/400)',
        'Read the event id from the x-razorpay-event-id header and skip ids already processed',
        'On payment.captured, find the order by razorpayOrderId and move it pending → paid only once',
        'Queue the email and reduce stock only on a real transition',
        'Send the same event twice, an unknown order, and a bad signature',
      ],
      code: `// server/src/controllers/webhooks.js (real version)
import crypto from 'node:crypto';

export async function razorpayWebhook(req, res) {
  // req.body is a Buffer because of express.raw() on this route
  const signature = req.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex');
  if (signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(400).json({ message: 'Invalid signature' });
  }
  const eventId = req.get('x-razorpay-event-id');
  try {
    await WebhookEvent.create({ _id: eventId, provider: 'razorpay' });   // unique _id
  } catch (e) {
    if (e.code === 11000) return res.json({ status: 'duplicate ignored' });
    throw e;
  }
  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload.payment.entity;
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: payment.order_id, status: 'pending' },
      { status: 'paid', razorpayPaymentId: payment.id, paidAt: new Date() },
      { new: true },
    );
    if (order) {
      await reduceStock(order);                 // atomic $inc with stock >= qty
      await emailQueue.add('order-confirmation', { orderId: order.id }, { jobId: 'confirm-' + order.id });
    }
  } else if (event.event === 'payment.failed') {
    await Order.updateOne({ razorpayOrderId: event.payload.payment.entity.order_id, status: 'pending' },
                          { status: 'failed' });
  }
  res.json({ status: 'ok' });                    // 2xx fast, heavy work is queued
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json()); // real app: express.raw({ type: 'application/json' }) on this route

const orders = [{ id: 'ord_1', razorpayOrderId: 'order_DEMO1', status: 'pending', productId: 'p1', qty: 1 }];
const stock = { p1: 10 };
const processedEvents = new Set();   // real app: WebhookEvent collection with unique _id
const emailQueue = [];

// STUB for the API Lab: real code compares HMAC_SHA256(rawBody, WEBHOOK_SECRET) with timingSafeEqual
const verifySignature = (req) => req.get('x-razorpay-signature') === 'valid-demo-signature';

app.post('/api/webhooks/razorpay', (req, res) => {
  if (!verifySignature(req)) return res.status(400).json({ message: 'Invalid signature' });

  const eventId = req.get('x-razorpay-event-id');
  if (processedEvents.has(eventId)) return res.json({ status: 'duplicate ignored', eventId });
  processedEvents.add(eventId);

  const { event, payload } = req.body;
  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const order = orders.find(o => o.razorpayOrderId === payment.order_id);
    if (!order) return res.json({ status: 'ok', note: 'order not found, logged for review' });
    if (order.status === 'pending') {          // conditional transition = idempotent
      order.status = 'paid';
      order.paymentId = payment.id;
      stock[order.productId] -= order.qty;
      emailQueue.push('order-confirmation:' + order.id);
    }
    return res.json({ status: 'ok', order: order.status, stock: stock[order.productId], emailsQueued: emailQueue.length });
  }
  res.json({ status: 'ignored', event });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/webhooks/razorpay', headers: { 'x-razorpay-signature': 'valid-demo-signature', 'x-razorpay-event-id': 'evt_001' }, body: { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_DEMO9', order_id: 'order_DEMO1', amount: 176882 } } } } },
          { method: 'POST', url: '/api/webhooks/razorpay', headers: { 'x-razorpay-signature': 'valid-demo-signature', 'x-razorpay-event-id': 'evt_001' }, body: { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_DEMO9', order_id: 'order_DEMO1', amount: 176882 } } } } },
          { method: 'POST', url: '/api/webhooks/razorpay', headers: { 'x-razorpay-signature': 'valid-demo-signature', 'x-razorpay-event-id': 'evt_002' }, body: { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_DEMO9', order_id: 'order_DEMO1', amount: 176882 } } } } },
          { method: 'POST', url: '/api/webhooks/razorpay', headers: { 'x-razorpay-signature': 'forged', 'x-razorpay-event-id': 'evt_003' }, body: { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_HACK', order_id: 'order_DEMO1', amount: 1 } } } } },
        ],
      },
      result: "POST /api/webhooks/razorpay → 200 {\"status\":\"ok\",\"order\":\"paid\",\"stock\":9,\"emailsQueued\":1}\nPOST /api/webhooks/razorpay → 200 {\"status\":\"duplicate ignored\",\"eventId\":\"evt_001\"}\nPOST /api/webhooks/razorpay → 200 {\"status\":\"ok\",\"order\":\"paid\",\"stock\":9,\"emailsQueued\":1}\nPOST /api/webhooks/razorpay → 400 {\"message\":\"Invalid signature\"}",
      explanation:
        "The first delivery moves the order from pending to paid, reduces stock from 10 to 9 and queues one email. The exact retry (same event id evt_001) is ignored. A different event about the same payment (evt_002, e.g. order.paid after payment.captured, or /verify having already marked it paid) still returns 200 but changes nothing, because the transition only happens when status is pending: stock stays 9 and only 1 email is queued. A forged request fails the signature check. Always answer 2xx for events you have safely recorded, otherwise Razorpay keeps retrying.",
    },
    {
      title: 'Order confirmation email with a queue (BullMQ) and Resend / Nodemailer',
      scenario: 'After payment, send a nicely formatted order confirmation without slowing the webhook, with retries if the email provider is down, and never twice.',
      steps: [
        'Create an email service with a provider switch (Resend in production, Ethereal/Nodemailer in development)',
        'Write an HTML template function that escapes user data',
        'Add a BullMQ queue "emails" and a worker with retries and backoff',
        'Enqueue with a deterministic jobId so duplicates are ignored',
        'Mark confirmationEmailSentAt on the order after a successful send',
      ],
      code: `// server/src/services/email.js
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = (paise) => 'Rs ' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export function orderConfirmationHtml(order, user) {
  const rows = order.items.map((i) =>
    \`<tr><td>\${escapeHtml(i.name)}</td><td>\${i.qty}</td><td>\${rupees(i.pricePaise * i.qty)}</td></tr>\`).join('');
  return \`
    <h2>Thank you, \${escapeHtml(user.name)}!</h2>
    <p>Your order <b>#\${order.number}</b> is confirmed.</p>
    <table cellpadding="6">\${rows}</table>
    <p>GST: \${rupees(order.gst)} | Delivery: \${rupees(order.delivery)}</p>
    <p><b>Total paid: \${rupees(order.totalPaise)}</b></p>
    <p><a href="\${process.env.CLIENT_URL}/orders/\${order._id}">Track your order</a></p>\`;
}

let sendImpl;
if (process.env.RESEND_API_KEY) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  sendImpl = async ({ to, subject, html }) => {
    const { data, error } = await resend.emails.send({ from: process.env.MAIL_FROM, to: [to], subject, html });
    if (error) throw new Error(error.message);
    return data.id;
  };
} else {
  // development: fake inbox (prints a preview URL)
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', port: 587, auth: { user: account.user, pass: account.pass },
  });
  sendImpl = async ({ to, subject, html }) => {
    const info = await transporter.sendMail({ from: '"ShopKart Dev" <dev@shopkart.test>', to, subject, html });
    console.log('Preview email:', nodemailer.getTestMessageUrl(info));
    return info.messageId;
  };
}
export const sendEmail = (msg) => sendImpl(msg);

// server/src/queues/email.js
import { Queue, Worker } from 'bullmq';
import Order from '../models/Order.js';
import { sendEmail, orderConfirmationHtml } from '../services/email.js';

const connection = { url: process.env.REDIS_URL };
export const emailQueue = new Queue('emails', {
  connection,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 10_000 }, removeOnComplete: 1000 },
});

new Worker('emails', async (job) => {
  if (job.name !== 'order-confirmation') return;
  const order = await Order.findById(job.data.orderId).populate('user', 'name email');
  if (!order || order.confirmationEmailSentAt) return 'skipped';     // idempotent
  await sendEmail({
    to: order.user.email,
    subject: 'Order #' + order.number + ' confirmed',
    html: orderConfirmationHtml(order, order.user),
  });
  order.confirmationEmailSentAt = new Date();
  await order.save();
}, { connection, concurrency: 5 });

// enqueue (from /verify or the webhook) - same jobId => added only once
await emailQueue.add('order-confirmation', { orderId: String(order._id) }, { jobId: 'confirm-' + order._id });`,
      explanation:
        "The webhook or verify endpoint only adds a job and returns immediately. BullMQ (on Redis) retries failed sends 5 times with exponential backoff, so a short outage at the email provider does not lose the email. The deterministic jobId prevents duplicate jobs, and confirmationEmailSentAt protects against duplicates even if a job runs twice. escapeHtml stops a customer named <script> from injecting HTML into emails. Ethereal in development gives you a preview link without sending real mail; in production set MAIL_FROM to an address on a domain with SPF, DKIM and DMARC configured.",
    },
  ],
  interview: [
    {
      q: 'Explain the complete Razorpay payment flow in a MERN app.',
      a: "1) React sends cart items to the API. 2) Server calculates the amount from the DB, creates its own pending order and a Razorpay order (amount in paise), returns razorpayOrderId, amount and key_id. 3) React opens Razorpay Checkout with order_id. 4) On success Checkout returns razorpay_payment_id, razorpay_order_id, razorpay_signature to the handler. 5) React posts them to /verify; the server checks HMAC_SHA256(order_id|payment_id, key_secret) and marks the order paid. 6) A webhook (payment.captured/order.paid) confirms server-to-server and handles cases where the browser never returned.",
      level: 'Medium',
    },
    {
      q: 'Why must the amount be calculated on the server?',
      a: "Anything sent from the browser can be modified in DevTools or with Postman. If the server trusts a client amount, users can pay Rs 1 for any product. The server must load prices from the database, apply coupons/taxes itself and create the Razorpay order with that amount; the client sends only product ids and quantities.",
      level: 'Easy',
    },
    {
      q: 'How is the Razorpay payment signature verified and why does it prove anything?',
      a: "Compute HMAC SHA256 of razorpay_order_id + '|' + razorpay_payment_id with your key_secret and compare (timing-safe) with razorpay_signature. Only Razorpay and your server know the secret, so a matching signature proves Razorpay generated this payment for this order. Use the order id stored in your database for that user, so a valid payment from another order cannot be replayed.",
      level: 'Medium',
    },
    {
      q: 'Why do you need webhooks if you already verify the payment in the browser callback?',
      a: "The browser flow is unreliable: users close the tab, lose network or get stuck in a UPI app after paying. Webhooks are server-to-server notifications with retries, so the order is updated anyway. They also cover events the browser never sees, like refunds, late captures, failed payments and disputes.",
      level: 'Easy',
    },
    {
      q: 'Why does webhook signature verification fail when you use express.json() on the webhook route?',
      a: "Razorpay signs the exact raw bytes it sent. express.json() parses them into an object; JSON.stringify(req.body) may produce different whitespace, key order or unicode escaping, so the HMAC differs. Mount express.raw({ type: 'application/json' }) for the webhook route before the global JSON parser, verify on the Buffer, then JSON.parse it yourself.",
      level: 'Hard',
    },
    {
      q: 'What does idempotency mean for payment webhooks and how do you implement it?',
      a: "Processing the same event multiple times must have the same effect as processing it once, because providers retry and may send related events (payment.captured and order.paid). Store processed event ids with a unique index (x-razorpay-event-id) and use conditional state transitions, e.g. updateOne({ _id, status: 'pending' }, { status: 'paid' }), so stock is reduced and emails are queued only on the first successful transition.",
      level: 'Hard',
    },
    {
      q: 'Why store money in paise (integers) instead of rupees with decimals?',
      a: "Floating point cannot represent many decimals exactly (0.1 + 0.2 !== 0.3), causing rounding errors in totals and taxes. Razorpay expects the amount in the smallest currency unit (paise) as an integer anyway. Store prices as integer paise (or use Decimal128 carefully) and format only for display.",
      level: 'Easy',
    },
    {
      q: 'How do you prevent overselling when two users pay for the last item at the same time?',
      a: "Use atomic conditional updates: Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }) and check modifiedCount; if 0, the item is sold out and you refund automatically. For multi-document updates (order + several products + cart) use a MongoDB transaction. Optionally reserve stock at checkout with an expiry and release it for abandoned orders.",
      level: 'Hard',
    },
    {
      q: 'Should the HTTP request that confirms a payment wait for the confirmation email to be sent?',
      a: "No. Email providers can be slow or down, and a failed email must not fail a successful payment. Enqueue a job (BullMQ/Redis, or at least fire-and-forget with logging) and return immediately. The worker retries with backoff and marks the order as emailed to avoid duplicates.",
      level: 'Medium',
    },
    {
      q: 'Compare Nodemailer and Resend for transactional emails.',
      a: "Nodemailer is a Node library that sends through any SMTP server (SES, Brevo, Mailgun, Gmail app password); free, flexible, but you manage SMTP credentials and deliverability depends on the provider. Resend is a hosted email API with a simple SDK, dashboards, webhooks for delivery events and React Email templates; easier DX with a free tier. Both require a verified domain with SPF, DKIM and DMARC for good inbox placement.",
      level: 'Medium',
    },
    {
      q: 'Why do transactional emails go to spam and how do you fix it?',
      a: "Common reasons: sending from a free mailbox domain (gmail.com) via a third-party server, missing SPF/DKIM/DMARC records, a new domain with no reputation, spammy content, or no plain-text part. Fix: send from your own verified subdomain (mail.yourshop.in) through a reputable provider, add SPF, DKIM and DMARC DNS records, include a text version, keep content transactional and monitor bounces/complaints.",
      level: 'Medium',
    },
    {
      q: 'How would you test the payment integration locally?',
      a: "Use Razorpay test mode keys (rzp_test_), test cards/UPI ids (e.g. success@razorpay, failure@razorpay). Expose your local API with ngrok or cloudflared and register that URL as the webhook in the test dashboard. Write unit tests for signature verification and the idempotent webhook handler (send the same event twice), and mock the Razorpay SDK in API tests.",
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write POST /api/payments/verify in Express 5: validate input, load the user\'s pending order, verify the signature against the stored razorpayOrderId, mark it paid with a conditional update, reduce stock and enqueue the email. Return 200 even if the order was already marked paid by the webhook.',
      hint: 'findOneAndUpdate({ _id, user, status: "pending" }) returns null if already paid.',
      solution: `import crypto from 'node:crypto';
import { z } from 'zod';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { emailQueue } from '../queues/email.js';

const verifySchema = z.object({
  orderId: z.string().length(24),
  razorpay_order_id: z.string().startsWith('order_'),
  razorpay_payment_id: z.string().startsWith('pay_'),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function verifyPayment(req, res) {
  const body = verifySchema.parse(req.body);
  const order = await Order.findOne({ _id: body.orderId, user: req.user.id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.razorpayOrderId !== body.razorpay_order_id) {
    return res.status(400).json({ message: 'Order mismatch' });
  }

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(order.razorpayOrderId + '|' + body.razorpay_payment_id)
    .digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(body.razorpay_signature))) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: 'pending' },
    { status: 'paid', razorpayPaymentId: body.razorpay_payment_id, paidAt: new Date() },
    { new: true },
  );
  if (updated) {
    for (const item of updated.items) {
      const r = await Product.updateOne({ _id: item.product, stock: { $gte: item.qty } }, { $inc: { stock: -item.qty } });
      if (r.modifiedCount === 0) await emailQueue.add('oversold-alert', { orderId: String(updated._id), product: String(item.product) });
    }
    await emailQueue.add('order-confirmation', { orderId: String(updated._id) }, { jobId: 'confirm-' + updated._id });
  }
  res.json({ status: 'paid', orderId: order._id });
}`,
    },
    {
      task: 'Design the Mongoose Order schema for a shop with Razorpay: items with price snapshot, totals in paise, status enum with allowed transitions, Razorpay ids, timestamps, and indexes for webhook lookups and "my orders".',
      hint: 'Index razorpayOrderId (unique, sparse) and { user: 1, createdAt: -1 }.',
      solution: `import mongoose from 'mongoose';

const STATUSES = ['pending', 'paid', 'failed', 'expired', 'shipped', 'delivered', 'cancelled', 'refunded'];
const TRANSITIONS = {
  pending: ['paid', 'failed', 'expired', 'cancelled'],
  paid: ['shipped', 'refunded', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  failed: [], expired: [], cancelled: ['refunded'], refunded: [],
};

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },         // snapshot
  pricePaise: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },   // human friendly, e.g. SK-2026-000123
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], validate: [(v) => v.length > 0, 'Order needs items'] },
  subtotal: Number, gst: Number, delivery: Number,
  totalPaise: { type: Number, required: true, min: 100 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: STATUSES, default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paidAt: Date,
  confirmationEmailSentAt: Date,
  shippingAddress: { name: String, line1: String, city: String, state: String, pincode: String, phone: String },
}, { timestamps: true });

orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: 1 });   // cron: expire old pending orders

orderSchema.methods.canMoveTo = function (next) {
  return TRANSITIONS[this.status]?.includes(next);
};

export default mongoose.model('Order', orderSchema);`,
    },
    {
      task: 'Write a cron job (node-cron) that runs every 10 minutes and expires pending orders older than 30 minutes, and an admin refund endpoint that calls Razorpay refunds and marks the order refunded when the webhook arrives.',
      hint: 'razorpay.payments.refund(paymentId, { amount }) and refund.processed webhook.',
      solution: `// server/src/jobs/expireOrders.js
import cron from 'node-cron';
import Order from '../models/Order.js';

cron.schedule('*/10 * * * *', async () => {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const r = await Order.updateMany({ status: 'pending', createdAt: { $lt: cutoff } }, { status: 'expired' });
  if (r.modifiedCount) console.log('expired', r.modifiedCount, 'pending orders');
});

// server/src/controllers/admin/refunds.js
import { razorpay } from '../../config/razorpay.js';
export async function refundOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!order.canMoveTo('refunded') || !order.razorpayPaymentId) {
    return res.status(409).json({ message: 'Order cannot be refunded in status ' + order.status });
  }
  const amount = req.body.amountPaise ?? order.totalPaise;          // partial or full
  const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
    amount, notes: { reason: req.body.reason || 'admin refund', by: String(req.user.id) },
  });
  order.refundId = refund.id;
  order.refundStatus = 'requested';
  await order.save();
  res.status(202).json({ refundId: refund.id, status: 'requested' });
}

// in the webhook handler
if (event.event === 'refund.processed') {
  const refund = event.payload.refund.entity;
  await Order.updateOne({ razorpayPaymentId: refund.payment_id }, { status: 'refunded', refundStatus: 'processed' });
}`,
    },
    {
      task: 'Build a password-reset email flow: POST /api/auth/forgot-password generates a random token (store only its SHA-256 hash with 15 min expiry), emails a link, and always returns the same response whether or not the email exists.',
      hint: 'crypto.randomBytes(32).toString("hex"); hash before saving; do not reveal if the user exists.',
      solution: `import crypto from 'node:crypto';
import User from '../models/User.js';
import { emailQueue } from '../queues/email.js';

export async function forgotPassword(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const link = process.env.CLIENT_URL + '/reset-password?token=' + token + '&email=' + encodeURIComponent(email);
    await emailQueue.add('password-reset', { to: email, name: user.name, link });
  }
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
}

export async function resetPassword(req, res) {
  const { email, token, password } = req.body;
  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await User.findOne({
    email: String(email).toLowerCase(),
    resetTokenHash: hash,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });
  user.password = password;              // pre-save hook hashes with bcrypt
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  user.tokenVersion += 1;                // invalidates existing refresh tokens
  await user.save();
  res.json({ message: 'Password updated. Please log in.' });
}`,
    },
  ],
  quiz: [
    {
      question: 'In which unit do you pass amount to razorpay.orders.create for INR?',
      options: ['Rupees as a decimal number', 'Paise as an integer', 'Dollars', 'A formatted string like "Rs 1,499"'],
      answer: 1,
      explanation: 'Razorpay expects the smallest currency unit as an integer: Rs 1,499.00 = 149900 paise.',
    },
    {
      question: 'What does the server compute to verify the Checkout success response?',
      options: [
        'bcrypt.hash(payment_id)',
        'jwt.verify(razorpay_signature)',
        'HMAC_SHA256(order_id + "|" + payment_id, key_secret) compared with razorpay_signature',
        'Nothing; if the handler ran, the payment succeeded',
      ],
      answer: 2,
      explanation: 'The signature is an HMAC that only Razorpay and your server (holding key_secret) can produce.',
    },
    {
      question: 'Which middleware should the Razorpay webhook route use so signature verification works?',
      options: ['express.raw({ type: "application/json" })', 'express.json()', 'express.urlencoded()', 'multer().none()'],
      answer: 0,
      explanation: 'The HMAC is computed over the exact raw bytes; parsing and re-stringifying JSON changes them.',
    },
    {
      question: 'The same payment.captured webhook arrives twice. What should happen?',
      options: ['Reduce stock twice', 'Return 500 so Razorpay stops', 'Send two confirmation emails', 'Detect the duplicate (event id / conditional status update) and change nothing the second time'],
      answer: 3,
      explanation: 'Webhook handlers must be idempotent: the second delivery is acknowledged with 2xx but has no extra effect.',
    },
    {
      question: 'Why send the order confirmation email through a queue instead of inside the verify request?',
      options: [
        'Queues make emails arrive faster than SMTP',
        'Email failures or slowness must not delay or fail the payment response, and the queue can retry',
        'Razorpay requires a queue',
        'Emails cannot be sent from Express',
      ],
      answer: 1,
      explanation: 'A background job decouples email delivery from checkout and retries with backoff when the provider is down.',
    },
  ],
};

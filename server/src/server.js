import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticate } from './middlewares/authHook.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Handle mock/conditional stripe initialization to prevent crash if key is missing
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecretKey);

// Registrar Plugins Corporativos
fastify.register(cors, { origin: true });
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'SPORTLUIZ_SECRET_KEY_2026' });

// Decorador para expor o middleware de autenticação
fastify.decorate('authenticate', authenticate);

// --- AUTHENTICATION ROUTES ---
fastify.post('/api/auth/register', async (request, reply) => {
  const { email, password } = request.body;
  try {
    // Nota: Em produção, aplique uma função de hash (ex: bcrypt ou argon2) na senha
    const user = await prisma.user.create({
      data: { email, password }
    });
    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    return reply.status(201).send({ token, user: { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier } });
  } catch (err) {
    fastify.log.error(err);
    return reply.status(400).send({ error: 'Falha ao registrar: E-mail já cadastrado.' });
  }
});

fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return reply.status(401).send({ error: 'Credenciais inválidas.' });
  }
  const token = fastify.jwt.sign({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier } };
});

// --- MATCH & EVENT MONITORING ---
fastify.get('/api/matches', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const matches = await prisma.match.findMany({
    where: { userId: request.user.id },
    include: { events: true },
    orderBy: { date: 'desc' }
  });
  return matches;
});

fastify.post('/api/matches', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { opponent } = request.body;
  if (!opponent) {
    return reply.status(400).send({ error: 'O nome do oponente é obrigatório.' });
  }
  const match = await prisma.match.create({
    data: { opponent, userId: request.user.id }
  });
  return match;
});

fastify.post('/api/events', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { type, posX, posY, minute, matchId } = request.body;

  const user = await prisma.user.findUnique({ where: { id: request.user.id } });
  
  // Regra de Negócio SaaS: Limitação do plano gratuito
  if (user.subscriptionTier === 'FREE') {
    const eventCount = await prisma.event.count({ where: { matchId } });
    if (eventCount >= 15) {
      return reply.status(403).send({ 
        error: 'Limite do plano gratuito atingido (Máx: 15 eventos por partida). Faça upgrade para o plano PRO.' 
      });
    }
  }

  const event = await prisma.event.create({
    data: {
      type,
      posX: parseFloat(posX),
      posY: parseFloat(posY),
      minute: parseInt(minute),
      matchId
    }
  });
  return event;
});

fastify.get('/api/matches/:matchId/analytics', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { matchId } = request.params;
  const events = await prisma.event.findMany({ where: { matchId } });
  
  const totalPasses = events.filter(e => e.type === 'PASS').length;
  const totalShots = events.filter(e => e.type === 'SHOT').length;
  const totalFouls = events.filter(e => e.type === 'FOUL').length;
  const totalGoals = events.filter(e => e.type === 'GOAL').length;

  return { totalPasses, totalShots, totalFouls, totalGoals, telemetry: events };
});

// --- STRIPE BILLING CORE ---
fastify.post('/api/stripe/checkout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { priceId } = request.body;
  const user = await prisma.user.findUnique({ where: { id: request.user.id } });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Erro ao registrar cliente no Stripe.' });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?checkout_success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/plans?checkout_canceled=true`,
    });
    return { url: session.url };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Erro ao gerar sessão de checkout.' });
  }
});

fastify.post('/api/stripe/webhook', { config: { rawBody: true } }, async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
  }

  if (stripeEvent.type === 'customer.subscription.created' || stripeEvent.type === 'customer.subscription.updated') {
    const subscription = stripeEvent.data.object;
    const customerId = subscription.customer;
    const planPriceId = subscription.items.data[0].price.id;

    let tier = 'PRO';
    if (planPriceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      tier = 'ENTERPRISE';
    }

    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { subscriptionTier: tier }
    });
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const subscription = stripeEvent.data.object;
    const customerId = subscription.customer;

    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { subscriptionTier: 'FREE' }
    });
  }

  return reply.status(200).send({ received: true });
});

// Inicialização do Servidor Fastify
const startServer = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 5000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
startServer();

export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Acesso recusado: Token inválido ou ausente' });
  }
}

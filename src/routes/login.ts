import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";

export async function loginRoutes(app: FastifyInstance) {
  app.post("/login/personals", async (request, reply) => {
    const getPersonalParamsSchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = getPersonalParamsSchema.parse(request?.body);

    const personal = await knex("personal_trainers")
      .where({ username, password })
      .first();

    if (!personal) reply.code(404).send("Usuário não encontrado");

    reply.code(200).send({
      type: "personal",
      user: {
        id: personal?.id,
        name: personal?.name,
        username: personal?.username,
      },
    });
  });

  app.post("/login/clients", async (request, reply) => {
    const getClientParamsSchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = getClientParamsSchema.parse(request.body);

    const client = await knex("clients").where({ username, password }).first();

    if (!client) reply.code(404).send("Usuário não encontrado");

    reply.code(200).send({
      type: "client",
      user: {
        id: client?.id,
        name: client?.name,
        username: client?.username,
      },
    });
  });
}

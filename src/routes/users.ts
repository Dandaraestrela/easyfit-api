import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../database";

export async function userRegistrationRoutes(app: FastifyInstance) {
  app.get("/personals", async () => {
    const personals = await knex("personal_trainers").select("*");
    return { personals };
  });

  app.get("/clients", async () => {
    const clients = await knex("clients").select("*");
    return { clients };
  });

  app.get("/personals/:id", async (request) => {
    const getPersonalParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getPersonalParamsSchema.parse(request.params);

    const personal = await knex("personal_trainers").where("id", id).first();

    return {
      personal: {
        id: personal?.id,
        name: personal?.name,
        username: personal?.username,
      },
    };
  });

  app.get("/clients/:id", async (request) => {
    const getClientParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getClientParamsSchema.parse(request.params);

    const client = await knex("clients").where("id", id).first();

    return {
      client: {
        id: client?.id,
        name: client?.name,
        username: client?.username,
      },
    };
  });

  app.post("/personal", async (request, reply) => {
    const createPersonalBodySchema = z.object({
      username: z.string(),
      password: z.string(),
      name: z.string(),
    });

    const { username, password, name } = createPersonalBodySchema.parse(
      request.body
    );

    await knex("personal_trainers").insert({
      id: randomUUID(),
      username,
      password,
      name,
    });

    return reply.status(201).send();
  });

  app.post("/client", async (request, reply) => {
    const createClientBodySchema = z.object({
      username: z.string(),
      password: z.string(),
      name: z.string(),
    });

    const { username, password, name } = createClientBodySchema.parse(
      request.body
    );

    await knex("clients").insert({
      id: randomUUID(),
      username,
      password,
      name,
    });

    return reply.status(201).send();
  });
}

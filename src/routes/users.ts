import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../database";

// prefix: "users"
export async function userRegistrationRoutes(app: FastifyInstance) {
  // Get de todos os personais do sistema
  app.get("/personals", async () => {
    const personals = await knex("personal_trainers").select("*");
    return { personals };
  });

  // Get de todos os clientes do sistema
  app.get("/clients", async (request) => {
    const clients = await knex("clients").select("*");
    return { clients };
  });

  // Get de personal por id
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

  // Get de cliente por id
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

  // Criação de personal
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
      createdAt: knex.fn.now(),
      username,
      password,
      name,
    });

    return reply.status(201).send();
  });

  // Criação de cliente
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
      createdAt: knex.fn.now(),
      username,
      password,
      name,
    });

    return reply.status(201).send();
  });

  // Reset de senha de cliente
  app.put("/client/password-reset:clientId", async (request, reply) => {
    try {
      const clientIdSchema = z.object({
        clientId: z.string(),
      });

      const createClientBodySchema = z.object({
        newPassword: z.string(),
      });

      const { clientId } = clientIdSchema.parse(request.query);

      const { newPassword } = createClientBodySchema.parse(request.body);

      await knex("clients")
        .where("id", clientId)
        .update({ password: newPassword });

      return reply.status(201).send();
    } catch (err) {
      return reply.status(400);
    }
  });

  // Deleção de cliente
  app.delete("/client:clientId", async (request, reply) => {
    try {
      const clientIdSchema = z.object({
        clientId: z.string(),
      });

      const { clientId } = clientIdSchema.parse(request.query);

      // pegando todos os ids dos treinos que eram desse cliente
      const workoutsIdsFromClient = await knex("workouts")
        .where("client_id", clientId)
        .select("id");
      // pegando todos os ids dos exercicios que eram desse cliente
      for (const workoutId of workoutsIdsFromClient) {
        const exercisesIdsFromClient = await knex("workout_exercises")
          .where("workout_id", workoutId.id)
          .select("exercise_id");
        // deletando todos os exercicios para aquele cliente
        for (const exerciseId of exercisesIdsFromClient) {
          await knex("exercise")
            .where("id", exerciseId.exercise_id)
            .first()
            .del();
        }
        // deletando tudo da tabela intermediaria de treinos dos treinos do cliente

        await knex("workout_exercises").where("workout_id", workoutId.id).del();
      }

      // deletando todos os treinos para aquele cliente
      await knex("workouts").where("client_id", clientId).del();

      // deletando cliente
      await knex("clients").where("id", clientId).del();

      reply.status(200);
    } catch (err) {
      return reply.status(400);
    }
  });
}

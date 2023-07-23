import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";
import { randomUUID } from "crypto";

export async function workoutRoutes(app: FastifyInstance) {
  // Get de todos os treinos do sistema - apagar depois
  app.get("/workouts", async (request, reply) => {
    const workouts = await knex("workouts").select("*");

    if (!workouts) reply.code(204).send("Não tem treinos cadastrados");

    reply.code(200).send({
      workouts,
    });
  });

  app.get("/workouts/:id", async (request, reply) => {
    const getWorkoutParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getWorkoutParamsSchema.parse(request.params);

    const workout = await knex("workouts").where("id", id).first();

    if (!workout) reply.code(400).send("Esse treino não existe.");

    let exercises = [];

    const exercisesIds = await knex("workout_exercises")
      .where("workout_id", id)
      .select("exercise_id");

    for (const exerciseId of exercisesIds) {
      const exercise = await knex("exercise")
        .where("id", exerciseId.exercise_id)
        .first();

      exercises.push(exercise);
    }

    reply.code(200).send({
      ...workout,
      exercises,
    });
  });

  // Get de todos os treinos de determinado cliente
  app.get("/workouts/client:clientId", async (request, reply) => {
    const workoutClientIdSchema = z.object({
      clientId: z.string(),
    });

    const { clientId } = workoutClientIdSchema.parse(request.query);

    const workouts = await knex("workouts").where("client_id", clientId);

    if (!workouts) reply.code(204).send("Não tem treinos cadastrados");

    let formattedResponse = [];

    for (const workout of workouts) {
      let exercises = [];

      const exercisesIds = await knex("workout_exercises")
        .where("workout_id", workout.id)
        .select("exercise_id");

      for (const exerciseId of exercisesIds) {
        const exercise = await knex("exercise")
          .where("id", exerciseId.exercise_id)
          .first();

        exercises.push(exercise);
      }

      formattedResponse.push({ ...workout, exercises });
    }

    reply.code(200).send({ workouts: formattedResponse });
  });

  app.get("/workouts/personal:personalId", async (request, reply) => {
    const workoutPersonalIdSchema = z.object({
      personalId: z.string(),
    });

    const { personalId } = workoutPersonalIdSchema.parse(request.query);

    const workouts = await knex("workouts").where("personal_id", personalId);

    if (!workouts) reply.code(204).send("Não tem treinos cadastrados");

    let formattedResponse = [];

    for (const workout of workouts) {
      const clientName = await knex("clients")
        .where("id", workout.client_id)
        .first()
        .select("name");

      formattedResponse.push({ ...workout, clientName: clientName?.name });
    }

    reply.code(200).send({ workouts: formattedResponse });
  });

  // Criação de treino
  app.post("/workouts", async (request, reply) => {
    const workoutSchema = z.object({
      clientId: z.string(),
      personalId: z.string(),
      name: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          repetitions: z.string(),
          link: z.string(),
          breathing: z.string(),
          description: z.string(),
        })
      ),
    });
    try {
      const { clientId, personalId, name, exercises } = workoutSchema.parse(
        request.body
      );

      let exercisesIntermediateIds: string[] = [];
      let workoutId = randomUUID();

      // adicionando treino à tabela de treinos
      await knex("workouts").insert({
        id: workoutId,
        createdAt: knex.fn.now(),
        client_id: clientId,
        personal_id: personalId,
        name,
        executed: 0,
      });

      // adicionando exercicios desse treino na tabela de exercicios
      for (const exercise of exercises) {
        const id = randomUUID();
        exercisesIntermediateIds.push(id);
        await knex("exercise").insert({
          id: id,
          name: exercise.name,
          repetitions: exercise.repetitions,
          link: exercise.link,
          breathing: exercise.breathing,
          description: exercise.description,
        });
      }

      // relacionando treino e exercícios na tabela intermediaria de treinos
      exercisesIntermediateIds.forEach(async (exercise) => {
        await knex("workout_exercises").insert({
          workout_id: workoutId,
          exercise_id: exercise,
        });
      });

      reply.status(201).send();
    } catch (err) {
      reply.status(400);
    }
  });

  // Edição de treino com determinado id (apaga exercicios e escreve de novo)
  app.put("/workout:workoutId", async (request, reply) => {
    const workoutIdSchema = z.object({
      workoutId: z.string(),
    });
    const workoutSchema = z.object({
      name: z.string(),
      exercises: z.any(),
    });

    const { workoutId } = workoutIdSchema.parse(request.query);
    const { name, exercises } = workoutSchema.parse(request.body);

    if (!name || !exercises) reply.status(400);

    // editando nome do treino
    await knex("workouts").where("id", workoutId).first().update({ name });

    const exercisesIdsFromWorkout = await knex("workout_exercises")
      .where("workout_id", workoutId)
      .select("exercise_id");

    // deletando exercicios da tabela intermediaria
    await knex("workout_exercises").where("workout_id", workoutId).del();
    // deletando exercicios da tabela de exercicios
    for (const exerciseId of exercisesIdsFromWorkout) {
      await knex("exercise").where("id", exerciseId).del();
    }

    // adicionando exercícios novamente
    let exercisesIntermediateIds: string[] = [];
    // adicionando exercicios desse treino na tabela de exercicios
    for (const exercise of exercises) {
      const id = randomUUID();
      exercisesIntermediateIds.push(id);
      await knex("exercise").insert({
        id: id,
        name: exercise.name,
        repetitions: exercise.repetitions,
        link: exercise.link,
        breathing: exercise.breathing,
        description: exercise.description,
      });
    }

    // relacionando treino e exercícios na tabela intermediaria de treinos
    exercisesIntermediateIds.forEach(async (exercise) => {
      await knex("workout_exercises").insert({
        workout_id: workoutId,
        exercise_id: exercise,
      });
    });

    // TODO adicionar created at

    reply.status(204);
  });

  // Edição da quantidade de execuções de um treino
  app.put("/workout/executions:workoutId", async (request, reply) => {
    const workoutIdSchema = z.object({
      workoutId: z.string(),
    });

    const workoutSchema = z.object({
      executed: z.number(),
    });

    const { executed } = workoutSchema.parse(request.body);

    const { workoutId } = workoutIdSchema.parse(request.query);

    if (!executed) reply.status(400);
    // editando nome do treino
    await knex("workouts").where("id", workoutId).first().update({ executed });

    reply.status(204);
  });

  // Deleção de treino
  app.delete("/workout:workoutId", async (request, reply) => {
    const workoutIdSchema = z.object({
      workoutId: z.string(),
    });
    const { workoutId } = workoutIdSchema.parse(request.query);

    const exercisesIdsFromWorkout = await knex("workout_exercises")
      .where("workout_id", workoutId)
      .select("exercise_id");

    // deletando exercicios da tabela intermediaria
    await knex("workout_exercises").where("workout_id", workoutId).del();
    // deletando exercicios da tabela de exercicios

    for (const exerciseId of exercisesIdsFromWorkout) {
      await knex("exercise").where("id", exerciseId.exercise_id).del();
    }
    // deletando treino
    await knex("workouts").where("id", workoutId).del();

    reply.status(200);
  });
}

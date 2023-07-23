import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    personal_trainers: {
      id: string;
      createdAt: date;
      username: string;
      password: string;
      name: string;
    };
    clients: {
      id: string;
      createdAt: date;
      username: string;
      password: string;
      name: string;
      personal_id: string;
    };
    workouts: {
      id: string;
      createdAt: date;
      name: string;
      personal_id: string;
      client_id: string;
      executed: number;
    };
    workout_exercises: {
      workout_id: string;
      exercise_id: string;
    };
    exercise: {
      id: string;
      name: string;
      name: string;
      repetitions: string;
      link: string;
      breathing: string;
      description: string;
    };
  }
}

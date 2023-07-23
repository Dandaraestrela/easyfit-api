import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("workout_exercises");
  await knex.schema.dropTable("workouts");
  await knex.schema.dropTable("clients");

  await knex.schema.createTable("clients", (table) => {
    table.uuid("id").primary(),
      table.timestamp("createdAt").defaultTo(knex.fn.now()),
      table
        .uuid("personal_id")
        .notNullable()
        .references("id")
        .inTable("personal_trainers"),
      table.string("username").notNullable(),
      table.string("password").notNullable(),
      table.string("name").notNullable().index();
  });

  await knex.schema.createTable("workouts", (table) => {
    table.uuid("id").primary(),
      table.timestamp("createdAt").defaultTo(knex.fn.now()),
      table.string("name").notNullable(),
      table
        .uuid("personal_id")
        .notNullable()
        .references("id")
        .inTable("personal_trainers"),
      table.uuid("client_id").notNullable().references("id").inTable("clients"),
      table.integer("executed").notNullable();
  });

  await knex.schema.createTable("workout_exercises", (table) => {
    table.uuid("workout_id").notNullable().references("id").inTable("workouts"),
      table
        .uuid("exercise_id")
        .notNullable()
        .references("id")
        .inTable("exercise");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("clients");
  await knex.schema.dropTable("workouts");
}

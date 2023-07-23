import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("exercise", (table) => {
    table.uuid("id").primary(),
      table.string("name").notNullable(),
      table.string("repetitions").notNullable();
  });

  await knex.schema.createTable("workout_exercises", (table) => {
    table
      .uuid("workout_id")
      .notNullable()
      .references("id")
      .inTable("workouts")
      .onDelete("CASCADE"),
      table
        .uuid("exercise_id")
        .notNullable()
        .references("id")
        .inTable("exercise")
        .onDelete("CASCADE");
  });

  await knex.schema.createTable("workouts", (table) => {
    table.uuid("id").primary(),
      table
        .uuid("personal_id")
        .notNullable()
        .references("id")
        .inTable("personal_trainers")
        .onDelete("CASCADE"),
      table
        .uuid("client_id")
        .notNullable()
        .references("id")
        .inTable("clients")
        .onDelete("CASCADE"),
      table.string("name").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {}

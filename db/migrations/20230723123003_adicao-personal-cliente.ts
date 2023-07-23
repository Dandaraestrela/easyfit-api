import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
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
  await knex.schema.alterTable("clients", (table) => {});
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("clients");
}

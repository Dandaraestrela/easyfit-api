import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("personal_trainers", (table) => {
    table.uuid("id").primary(),
      table.string("username").notNullable(),
      table.string("password").notNullable(),
      table.string("name").notNullable().index();
  });

  await knex.schema.createTableLike("clients", "personal_trainers");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("personal_trainers");

  await knex.schema.dropTable("clients");
}

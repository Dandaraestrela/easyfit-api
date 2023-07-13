import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    personal_trainers: {
      id: string;
      username: string;
      password: string;
      name: string;
    };
    clients: { id: string; username: string; password: string; name: string };
  }
}

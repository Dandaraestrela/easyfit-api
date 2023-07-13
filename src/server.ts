import fastify from "fastify";
import { knex } from "./database";
import { userRegistrationRoutes } from "./routes/users";

const app = fastify();

app.register(userRegistrationRoutes, { prefix: "users" });

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });

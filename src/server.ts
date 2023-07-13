import fastify from "fastify";
import { knex } from "./database";
import { userRegistrationRoutes } from "./routes/users";
import { env } from "./env";

const app = fastify();

app.register(userRegistrationRoutes, { prefix: "users" });

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });

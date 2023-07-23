import fastify from "fastify";
import cors from "@fastify/cors";

import { knex } from "./database";
import { userRegistrationRoutes } from "./routes/users";
import { env } from "./env";
import { loginRoutes } from "./routes/login";
import { workoutRoutes } from "./routes/workouts";

const app = fastify();

app.register(cors, { origin: "*" });

app.register(userRegistrationRoutes, { prefix: "users" });

app.register(loginRoutes);

app.register(workoutRoutes);

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });

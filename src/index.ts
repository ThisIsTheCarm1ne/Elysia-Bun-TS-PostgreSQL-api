import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { signup } from "./controllers/user_auth/signup";
import { login } from "./controllers/user_auth/login";
import { passwordChange } from "./controllers/user_auth/passwordChange";
import { getItems } from "./controllers/items/getItems";
import { buyItem } from "./controllers/marketplace/buyItem";

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .use(cors())
    .use(signup)
    .use(login)
    .use(passwordChange)
    .use(getItems)
    .use(buyItem)
    .listen({idleTimeout: 255, port: 3000});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

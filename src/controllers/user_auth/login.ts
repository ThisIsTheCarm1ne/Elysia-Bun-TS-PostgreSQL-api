import {
    Elysia,
} from "elysia";

import { createSession } from '../../store/sessionStore';

import { sql } from '../../db';

interface ILoginRequestBody {
    email: string;
    password: string;
}

export const login = new Elysia()
    .post('/login', async ({ body }: { body: ILoginRequestBody }) => {
        const { email, password } = body;

        const user = await sql`SELECT * FROM users WHERE email = ${email}`;

        if (!user.length || !(await Bun.password.verify(password, user[0].password))) {
            return { error: 'Invalid credentials' };
        }

        const sessionId = createSession(user[0].id);

        return { sessionId, message: 'Logged in successfully' };
    });

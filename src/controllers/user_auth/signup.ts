import {
    Elysia,
} from "elysia";
import { sql } from '../../db';

interface ISignUpRequestBody {
    email: string;
    password: string;
}

export const signup = new Elysia()
    .post('/signup', async ({ body }: { body: ISignUpRequestBody} ) => {
        try {
            const { email, password } = body;

            const hashedPassword = await Bun.password.hash(password);

            const data = await sql`
                INSERT INTO users (email, password)
                VALUES (${email}, ${hashedPassword})
            `;

            return { message: 'User registered successfully' };
        } catch (e: any) {
            console.log(e);
            return {
                message: 'Couldn\'t sign up a user',
                status: 500,
            };
        }
    })
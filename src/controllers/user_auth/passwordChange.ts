import {
    Elysia,
} from "elysia";

import { getSessionUserId } from '../../store/sessionStore';

import { sql } from '../../db';

interface IPasswordChangeRequestBody {
    oldPassword: string;
    newPassword: string;
}

export const passwordChange = new Elysia()
    .post('/passwordChange', async ({body, headers}: { body: IPasswordChangeRequestBody, headers: any}) => {
        const { oldPassword, newPassword } = body;

        const sessionId = headers['session-id'];
        if (!sessionId) return { error: 'No Session ID was provided' };

        const userId = getSessionUserId(sessionId);
        if (!userId) return { error: 'Unauthorized' };

        const user = await sql`SELECT * FROM users WHERE id = ${userId}`;

        if (!user.length || !(await Bun.password.verify(oldPassword, user[0].password))) {
            return { error: 'Invalid old password' };
        }

        const hashedNewPassword = await Bun.password.hash(newPassword);
        await sql`UPDATE users SET password = ${hashedNewPassword} WHERE id = ${userId}`;

        return { message: 'Password updated successfully' };
    })
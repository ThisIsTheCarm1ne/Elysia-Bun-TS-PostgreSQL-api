import {
    Elysia,
} from "elysia";
import { sql } from "../../db";

interface IBuyItemRequestBody {
    userId: string;
    productId: string;
}

export const buyItem = new Elysia()
    .post('/buyItem', async ({ body }: { body: IBuyItemRequestBody }) => {
        try {
            const { userId, productId } = body;

            if (!userId || !productId) return { error: 'Missing user id or product id' };

            const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
            if (!user) return { error: 'User not found' };

            const [product] = await sql`SELECT * FROM products WHERE id = ${productId}`;
            if (!product) return { error: 'Product not found' };

            if (user.balance < product.price) return { error: 'Insufficient balance' };

            const updatedBalance = user.balance - product.price;

            await sql.begin(async (transaction) => {
                await transaction`UPDATE users SET balance = ${updatedBalance} WHERE id = ${userId}`;

                await transaction`INSERT INTO purchases (user_id, product_id) VALUES (${userId}, ${productId})`;
            });

            return { balance: updatedBalance };
        } catch (error) {
            console.error('Error processing purchase:', error);
            return { error: 'Internal server error' };
        }
    })
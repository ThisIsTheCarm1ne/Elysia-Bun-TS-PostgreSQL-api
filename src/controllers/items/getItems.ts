import {
    Elysia,
} from "elysia";
import { Redis } from "ioredis"

const redis = new Redis();

const CACHE_TTL = 300; //5 mins

// Searches cache for cached data,
// if there's no cache - calls api
const fetchItems = async (tradable: boolean) => {
    const cacheKey = `items:tradable:${tradable}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        console.log('Serving data from cache');
        return JSON.parse(cachedData);
    }

    const params = new URLSearchParams({
        tradable: String(tradable),
    });

    const response = await fetch(`https://api.skinport.com/v1/items?${params}`, {
        method: 'GET',
        headers: {
            'Accept-Encoding': 'br',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the response in Redis
    await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL);

    return data;
}

// Calls API 2 times to get tradable and non-tradable items
// Then combining them into one array
// Caches for 5 minutes and returns it
export const getItems = new Elysia()
    .get('/items', async () => {
        try {
            // Fetch tradable and non-tradable data
            const [tradableItems, nonTradableItems] = await Promise.all([
                fetchItems(true),
                fetchItems(false),
            ]);

            // Combine and process data
            const combined = tradableItems.map((tradableItem: any) => {
                const nonTradableItem = nonTradableItems.find(
                    (item: any) => item.market_hash_name === tradableItem.market_hash_name
                );

                return {
                    market_hash_name: tradableItem.market_hash_name,
                    tradable_min_price: tradableItem.min_price,
                    non_tradable_min_price: nonTradableItem?.min_price || null,
                };
            });

            return combined;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    })
// Stores user's sessions
const sessions = new Map<string, string>();

export const createSession = (userId: string): string => {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, userId);
    return sessionId;
};

export const getSessionUserId = (sessionId: string): string | undefined => {
    return sessions.get(sessionId);
};

export const deleteSession = (sessionId: string): void => {
    sessions.delete(sessionId);
};
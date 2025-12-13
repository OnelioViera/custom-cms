// Postgres-based user authentication functions
import { db } from './db';
import { users } from './db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

export async function findUserByEmail(email: string, siteId: string = SITE_ID) {
    try {
        const results = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.email, email.toLowerCase()),
                    eq(users.siteId, siteId)
                )
            )
            .limit(1);

        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

export async function createUser(email: string, password: string, role: string = 'editor', siteId: string = SITE_ID) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${Date.now()}`;

        const result = await db
            .insert(users)
            .values({
                userId,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                siteId,
            })
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function verifyUserPassword(email: string, password: string, siteId: string = SITE_ID) {
    try {
        const user = await findUserByEmail(email, siteId);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    } catch (error) {
        console.error('Error verifying password:', error);
        return null;
    }
}

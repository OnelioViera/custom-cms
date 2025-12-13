import { createUser, findUserByEmail } from './auth';

export async function setupAdminUser() {
    const siteId = 'lindsayprecast';
    const email = 'admin@lindsayprecast.com';
    const password = 'password123';

    const existing = await findUserByEmail(email, siteId);
    if (!existing) {
        await createUser(email, password, 'admin', siteId);
        // Optionally log or notify that admin was created
    }
}
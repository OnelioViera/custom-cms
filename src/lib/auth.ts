
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { getSiteId } from './env';

const SITE_ID = getSiteId();

interface IUser extends Document {
    userId: string;
    siteId: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    userId: { type: String, required: true, unique: true },
    siteId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'editor' },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export async function findUserByEmail(email: string, siteId: string = SITE_ID) {
    await connectDB();
    return User.findOne({ email: email.toLowerCase(), siteId });
}

export async function createUser(email: string, password: string, role: string = 'editor', siteId: string = SITE_ID) {
    await connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    const user = new User({
        userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        siteId,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    await user.save();
    return user;
}

export async function verifyUserPassword(email: string, password: string, siteId: string = SITE_ID) {
    const user = await findUserByEmail(email, siteId);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}

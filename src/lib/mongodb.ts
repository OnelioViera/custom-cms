// lib/db.ts - OPTIMIZED VERSION
// lib/db.ts - OPTIMIZED VERSION
import mongoose from "mongoose";
import { getMongoUri } from "./env";
import { setupAdminUser } from './setup-admin-user';

const MONGODB_URI = getMongoUri();

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the cached type
interface CachedConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Use global to cache the connection across hot reloads in development
declare global {
    var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connectDB() {
    // Return existing connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // Return pending connection promise if it exists
    if (cached.promise) {
        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch (e) {
            cached.promise = null;
            throw e;
        }
    }

    // Create new connection
    const opts: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
    });

    try {
        cached.conn = await cached.promise;

        // Setup admin user only once per connection
        if (!cached.conn.connection.readyState) {
            await setupAdminUser();
        } else {
            // Run in background to not block the connection
            setupAdminUser().catch(console.error);
        }

        return cached.conn;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', e);
        throw e;
    }
}

// Helper to disconnect (useful for testing or cleanup)
export async function disconnectDB() {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
    }
}

// Export mongoose instance for direct use if needed
export { mongoose };

// Default export
export default connectDB;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB URI from .env.local
const MONGODB_URI = 'mongodb+srv://ojvwebdesign_db_user:Daniel2025@cluster0.ikupnjc.mongodb.net/custom-cms';
const SITE_ID = 'lindsayprecast';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {})
    .then(async () => {
        console.log('📡 Connected to MongoDB');

        const userSchema = new mongoose.Schema({
            siteId: String,
            email: String,
            password: String,
            role: String,
            active: Boolean,
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const hashedPassword = bcrypt.hashSync('password123', 10);

        const result = await User.findOneAndUpdate(
            {
                email: 'admin@lindsayprecast.com',
                siteId: SITE_ID
            },
            {
                siteId: SITE_ID,
                email: 'admin@lindsayprecast.com',
                password: hashedPassword,
                role: 'admin',
                active: true,
            },
            { upsert: true, new: true }
        );

        console.log('✅ User created/updated:', result.email);
        console.log('📧 Email: admin@lindsayprecast.com');
        console.log('🔑 Password: password123');
        console.log('👤 Role:', result.role);
        console.log('✔️ Active:', result.active);

        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });

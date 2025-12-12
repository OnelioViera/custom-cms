const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not found');
    console.error('   Set it using: set MONGODB_URI=your_connection_string (Windows)');
    console.error('   Or: export MONGODB_URI=your_connection_string (Linux/Mac)');
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

        // Get credentials from command line or use defaults
        const email = process.argv[2] || 'admin@lindsayprecast.com';
        const password = process.argv[3] || 'password123';
        const role = process.argv[4] || 'admin';

        const hashedPassword = bcrypt.hashSync(password, 10);

        const result = await User.findOneAndUpdate(
            {
                email: email.toLowerCase(),
                siteId: SITE_ID
            },
            {
                siteId: SITE_ID,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role,
                active: true,
            },
            { upsert: true, new: true }
        );

        console.log('✅ User created/updated:', result.email);
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Role:', result.role);
        console.log('✔️ Active:', result.active);
        console.log('\n⚠️  Remember to change the default password in production!');

        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });

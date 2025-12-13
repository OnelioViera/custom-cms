// Script to create the 'team' content type in the CMS
// Run with: node create-team-content-type.js
// Make sure MONGODB_URI environment variable is set

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not found');
    console.error('   Set it using: set MONGODB_URI=your_connection_string (Windows)');
    console.error('   Or: export MONGODB_URI=your_connection_string (Linux/Mac)');
    process.exit(1);
}

// Content Type Schema (matching cms-models.ts)
const contentTypeSchema = new mongoose.Schema(
    {
        siteId: { type: String, required: true, index: true },
        contentTypeId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        fields: [
            {
                fieldId: { type: String, required: true },
                name: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['text', 'richtext', 'number', 'boolean', 'date', 'image', 'file', 'select', 'reference', 'json', 'url'],
                    required: true,
                },
                required: { type: Boolean, default: false },
                options: mongoose.Schema.Types.Mixed,
            },
        ],
        isSystem: { type: Boolean, default: false },
    },
    { timestamps: true }
);

contentTypeSchema.index({ siteId: 1, contentTypeId: 1 }, { unique: true });

const ContentType = mongoose.models.ContentType || mongoose.model('ContentType', contentTypeSchema);

mongoose.connect(MONGODB_URI, {})
    .then(async () => {
        console.log('📡 Connected to MongoDB');

        // Check if 'team' content type already exists
        const existing = await ContentType.findOne({ siteId: SITE_ID, contentTypeId: 'team' });
        
        if (existing) {
            console.log('⚠️  Team content type already exists!');
            console.log('Existing content type:', existing.name);
        } else {
            // Create the team content type
            const teamContentType = new ContentType({
                siteId: SITE_ID,
                contentTypeId: 'team',
                name: 'Team Members',
                description: 'Team members displayed in the carousel on the homepage',
                fields: [
                    {
                        fieldId: 'name',
                        name: 'Name',
                        type: 'text',
                        required: true,
                    },
                    {
                        fieldId: 'role',
                        name: 'Role',
                        type: 'text',
                        required: true,
                    },
                    {
                        fieldId: 'description',
                        name: 'Description',
                        type: 'richtext',
                        required: false,
                    },
                    {
                        fieldId: 'avatar',
                        name: 'Avatar',
                        type: 'image',
                        required: false,
                    },
                    {
                        fieldId: 'order',
                        name: 'Display Order',
                        type: 'number',
                        required: false,
                    },
                ],
                isSystem: false,
            });

            await teamContentType.save();
            console.log('✅ Team content type created successfully!');
        }

        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });


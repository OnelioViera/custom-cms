const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ojvwebdesign_db_user:Daniel2025@cluster0.ikupnjc.mongodb.net/Cluster0';

async function addIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;
    
    // Fix duplicate slugs first
    console.log('Fixing duplicate slugs...');
    const contentsWithNullSlug = await db.collection('contents').find({ slug: null }).toArray();
    for (const content of contentsWithNullSlug) {
      const newSlug = content.contentId || content._id.toString();
      await db.collection('contents').updateOne(
        { _id: content._id },
        { $set: { slug: newSlug } }
      );
    }
    console.log(`✅ Fixed ${contentsWithNullSlug.length} documents with null slugs`);
    
    // Now add indexes
    console.log('Adding indexes...');
    
    // Drop existing slug index if it exists
    try {
      await db.collection('contents').dropIndex('slug_1');
      console.log('Dropped old slug index');
    } catch (e) {
      // Index might not exist, that is okay
    }
    
    await db.collection('contents').createIndex({ slug: 1 }, { unique: true, sparse: true });
    await db.collection('contents').createIndex({ contentType: 1, status: 1 });
    await db.collection('contents').createIndex({ createdAt: -1 });
    await db.collection('contents').createIndex({ updatedAt: -1 });
    
    // Users indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (e) {
      console.log('Email index already exists');
    }
    
    // Site content indexes
    try {
      await db.collection('sitecontents').createIndex({ siteId: 1 }, { unique: true });
    } catch (e) {
      console.log('SiteId index already exists');
    }
    
    console.log('✅ All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}
addIndexes();

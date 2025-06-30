import { Db } from 'mongodb';
import { organizationSchema } from './organization';

export async function initializeCollections(db: Db) {
  // Check if collections exist and create them with validation if they don't
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);

  // Initialize organizations collection if it doesn't exist
  if (!collectionNames.includes('organizations')) {
    await db.createCollection('organizations', {
      validator: {
        $jsonSchema: organizationSchema
      }
    });

    // Create indexes
    await db.collection('organizations').createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { name: 1 } },
      { key: { 'members.userId': 1 } },
      { key: { status: 1 } },
      { key: { createdAt: 1 } },
      { key: { updatedAt: 1 } }
    ]);

    console.log('Organizations collection initialized with schema validation and indexes');
  }
}

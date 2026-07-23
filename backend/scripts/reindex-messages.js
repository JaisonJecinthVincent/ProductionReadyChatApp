import 'dotenv/config';
import { connectDB } from '../src/lib/db.js';
import esClient from '../src/lib/elasticsearch.js';
import messageIndexer from '../src/services/messageIndexer.js';

async function reindexMessages() {
  try {
    console.log('🚀 Starting message reindexing...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Initialize Elasticsearch
    await esClient.initialize();
    
    if (!esClient.isAvailable()) {
      console.error('❌ Elasticsearch is not available. Please ensure it is running.');
      process.exit(1);
    }
    
    console.log('✅ Connected to Elasticsearch');
    
    // Reindex all messages
    const success = await messageIndexer.reindexAllMessages(1000);
    
    if (success) {
      console.log('🎉 Reindexing completed successfully!');
      process.exit(0);
    } else {
      console.error('❌ Reindexing failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error during reindexing:', error);
    process.exit(1);
  }
}

reindexMessages();

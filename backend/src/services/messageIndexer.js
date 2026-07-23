import esClient from '../lib/elasticsearch.js';
import Message from '../models/message.model.js';

class MessageIndexer {
  /**
   * Index a single message to Elasticsearch
   */
  async indexMessage(message) {
    try {
      if (!esClient.isAvailable()) {
        return false;
      }

      await esClient.indexMessage(message);
      return true;
    } catch (error) {
      console.error('Failed to index message:', error.message);
      return false;
    }
  }

  /**
   * Delete a message from Elasticsearch
   */
  async deleteMessage(messageId) {
    try {
      if (!esClient.isAvailable()) {
        return false;
      }

      await esClient.deleteMessage(messageId);
      return true;
    } catch (error) {
      console.error('Failed to delete message from index:', error.message);
      return false;
    }
  }

  /**
   * Update a message in Elasticsearch
   */
  async updateMessage(messageId, updates) {
    try {
      if (!esClient.isAvailable()) {
        return false;
      }

      await esClient.updateMessage(messageId, updates);
      return true;
    } catch (error) {
      console.error('Failed to update message in index:', error.message);
      return false;
    }
  }

  /**
   * Reindex all messages from MongoDB to Elasticsearch
   * Useful for initial setup or after Elasticsearch downtime
   */
  async reindexAllMessages(batchSize = 1000) {
    try {
      if (!esClient.isAvailable()) {
        console.error('Elasticsearch not available for reindexing');
        return false;
      }

      console.log('🔄 Starting full reindex of messages...');
      
      const totalMessages = await Message.countDocuments();
      console.log(`📊 Total messages to index: ${totalMessages}`);

      let processed = 0;
      let batch = [];

      const cursor = Message.find({}).lean().cursor();

      for await (const message of cursor) {
        batch.push(message);

        if (batch.length >= batchSize) {
          await esClient.bulkIndex(batch);
          processed += batch.length;
          console.log(`✅ Indexed ${processed}/${totalMessages} messages`);
          batch = [];
        }
      }

      // Index remaining messages
      if (batch.length > 0) {
        await esClient.bulkIndex(batch);
        processed += batch.length;
        console.log(`✅ Indexed ${processed}/${totalMessages} messages`);
      }

      console.log('🎉 Reindexing complete!');
      return true;
    } catch (error) {
      console.error('Failed to reindex messages:', error.message);
      return false;
    }
  }

  /**
   * Sync recent messages (useful after Elasticsearch downtime)
   */
  async syncRecentMessages(minutes = 60) {
    try {
      if (!esClient.isAvailable()) {
        return false;
      }

      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      const recentMessages = await Message.find({
        createdAt: { $gte: cutoffTime }
      }).lean();

      if (recentMessages.length > 0) {
        await esClient.bulkIndex(recentMessages);
        console.log(`✅ Synced ${recentMessages.length} recent messages to Elasticsearch`);
      }

      return true;
    } catch (error) {
      console.error('Failed to sync recent messages:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const messageIndexer = new MessageIndexer();

export default messageIndexer;
export { messageIndexer };

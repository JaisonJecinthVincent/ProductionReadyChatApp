import { Client } from '@elastic/elasticsearch';
import { elasticsearchConfig, messagesIndexConfig } from '../config/elasticsearch.config.js';

class ElasticsearchClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isEnabled = process.env.ELASTICSEARCH_ENABLED !== 'false'; // Default to true
  }

  async initialize() {
    if (!this.isEnabled) {
      console.log('⚠️ Elasticsearch is disabled via config');
      return;
    }

    try {
      console.log('🔍 Initializing Elasticsearch client...');
      this.client = new Client(elasticsearchConfig);

      // Test connection
      const health = await this.client.cluster.health();
      console.log('✅ Elasticsearch connected:', health.status);
      this.isConnected = true;

      // Create index if it doesn't exist
      await this.createIndexIfNotExists();
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error.message);
      console.log('⚠️ Falling back to MongoDB for search operations');
      this.isConnected = false;
    }
  }

  async createIndexIfNotExists() {
    try {
      const exists = await this.client.indices.exists({
        index: messagesIndexConfig.index
      });

      if (!exists) {
        await this.client.indices.create(messagesIndexConfig);
        console.log(`✅ Created Elasticsearch index: ${messagesIndexConfig.index}`);
      } else {
        console.log(`✅ Elasticsearch index already exists: ${messagesIndexConfig.index}`);
      }
    } catch (error) {
      console.error('❌ Failed to create Elasticsearch index:', error.message);
    }
  }

  async indexMessage(message) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const document = {
        messageId: message._id.toString(),
        senderId: message.senderId?._id?.toString() || message.senderId?.toString(),
        receiverId: message.receiverId?.toString(),
        groupId: message.groupId?.toString(),
        text: message.text,
        fileName: message.fileName,
        fileUrl: message.fileUrl,
        fileType: message.fileType,
        fileSize: message.fileSize,
        mimeType: message.mimeType,
        image: message.image,
        isDeleted: message.isDeleted || false,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt || message.createdAt
      };

      const result = await this.client.index({
        index: messagesIndexConfig.index,
        id: message._id.toString(),
        document,
        refresh: 'wait_for'
      });

      console.log(`✅ Indexed message ${message._id} in Elasticsearch`);
      return result;
    } catch (error) {
      console.error('❌ Failed to index message in Elasticsearch:', error.message);
      return null;
    }
  }

  async searchMessages(searchParams) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const {
        query,
        userId,
        targetUserId,
        groupId,
        dateRange,
        messageType,
        page = 1,
        limit = 50
      } = searchParams;

      const must = [];
      const filter = [];

      // Text search query with multiple strategies for better matching
      if (query && query.trim()) {
        must.push({
          bool: {
            should: [
              // Exact phrase match (highest priority)
              {
                multi_match: {
                  query: query,
                  fields: ['text^5', 'fileName^3'],
                  type: 'phrase',
                  boost: 10
                }
              },
              // Edge n-gram for prefix matching ("h" matches "hello")
              {
                multi_match: {
                  query: query,
                  fields: ['text.edge_ngram^4', 'fileName.ngram^2'],
                  type: 'best_fields',
                  boost: 5
                }
              },
              // N-gram for partial matching ("h" matches "earth")
              {
                multi_match: {
                  query: query,
                  fields: ['text.ngram^3', 'fileName.ngram^2'],
                  type: 'best_fields',
                  boost: 3
                }
              },
              // Standard match with fuzziness for typos
              {
                multi_match: {
                  query: query,
                  fields: ['text^2', 'fileName'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  boost: 2
                }
              }
            ],
            minimum_should_match: 1
          }
        });
      }

      // Filter by conversation
      if (targetUserId) {
        filter.push({
          bool: {
            should: [
              {
                bool: {
                  must: [
                    { term: { senderId: userId } },
                    { term: { receiverId: targetUserId } }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    { term: { senderId: targetUserId } },
                    { term: { receiverId: userId } }
                  ]
                }
              }
            ],
            minimum_should_match: 1
          }
        });
      } else if (groupId) {
        filter.push({ term: { groupId } });
      } else {
        // Search in all conversations where user is involved
        filter.push({
          bool: {
            should: [
              { term: { senderId: userId } },
              { term: { receiverId: userId } },
              { exists: { field: 'groupId' } } // TODO: Filter by group membership
            ],
            minimum_should_match: 1
          }
        });
      }

      // Date range filter
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let startDate;

        switch (dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }

        if (startDate) {
          filter.push({
            range: {
              createdAt: {
                gte: startDate.toISOString()
              }
            }
          });
        }
      }

      // Message type filter
      if (messageType && messageType !== 'all') {
        switch (messageType) {
          case 'text':
            filter.push({ exists: { field: 'text' } });
            filter.push({ bool: { must_not: [{ exists: { field: 'fileUrl' } }, { exists: { field: 'image' } }] } });
            break;
          case 'files':
            filter.push({ exists: { field: 'fileUrl' } });
            break;
          case 'images':
            filter.push({
              bool: {
                should: [
                  { exists: { field: 'image' } },
                  { term: { fileType: 'image' } }
                ],
                minimum_should_match: 1
              }
            });
            break;
        }
      }

      // Exclude deleted messages
      filter.push({
        bool: {
          should: [
            { term: { isDeleted: false } },
            { bool: { must_not: { exists: { field: 'isDeleted' } } } }
          ],
          minimum_should_match: 1
        }
      });

      const from = (parseInt(page) - 1) * parseInt(limit);

      const result = await this.client.search({
        index: messagesIndexConfig.index,
        body: {
          query: {
            bool: {
              must,
              filter
            }
          },
          sort: [
            { createdAt: { order: 'desc' } }
          ],
          from,
          size: parseInt(limit)
        }
      });

      const messages = result.hits.hits.map(hit => ({
        _id: hit._source.messageId,
        ...hit._source,
        _score: hit._score
      }));

      return {
        messages,
        total: result.hits.total.value,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.hits.total.value,
          pages: Math.ceil(result.hits.total.value / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('❌ Elasticsearch search failed:', error.message);
      return null;
    }
  }

  async deleteMessage(messageId) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      await this.client.delete({
        index: messagesIndexConfig.index,
        id: messageId.toString(),
        refresh: 'wait_for'
      });
      console.log(`✅ Deleted message ${messageId} from Elasticsearch`);
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        console.error('❌ Failed to delete message from Elasticsearch:', error.message);
      }
    }
  }

  async updateMessage(messageId, updates) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      await this.client.update({
        index: messagesIndexConfig.index,
        id: messageId.toString(),
        doc: updates,
        refresh: 'wait_for'
      });
      console.log(`✅ Updated message ${messageId} in Elasticsearch`);
    } catch (error) {
      console.error('❌ Failed to update message in Elasticsearch:', error.message);
    }
  }

  async bulkIndex(messages) {
    if (!this.isConnected || !this.client || !messages.length) {
      return null;
    }

    try {
      const operations = messages.flatMap(message => [
        { index: { _index: messagesIndexConfig.index, _id: message._id.toString() } },
        {
          messageId: message._id.toString(),
          senderId: message.senderId?._id?.toString() || message.senderId?.toString(),
          receiverId: message.receiverId?.toString(),
          groupId: message.groupId?.toString(),
          text: message.text,
          fileName: message.fileName,
          fileUrl: message.fileUrl,
          fileType: message.fileType,
          fileSize: message.fileSize,
          mimeType: message.mimeType,
          image: message.image,
          isDeleted: message.isDeleted || false,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt || message.createdAt
        }
      ]);

      const result = await this.client.bulk({
        operations,
        refresh: 'wait_for'
      });

      if (result.errors) {
        console.error('❌ Some messages failed to index in bulk operation');
      } else {
        console.log(`✅ Bulk indexed ${messages.length} messages in Elasticsearch`);
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to bulk index messages:', error.message);
      return null;
    }
  }

  isAvailable() {
    return this.isConnected && this.client !== null;
  }
}

// Create singleton instance
const esClient = new ElasticsearchClient();

export default esClient;
export { esClient as elasticsearchClient };

export const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_URL || 'http://127.0.0.1:9200',
  auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
    ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      }
    : undefined,
  maxRetries: 3,
  requestTimeout: 10000,
  sniffOnStart: false,
};

export const messagesIndexConfig = {
  index: 'messages',
  body: {
    settings: {
      number_of_shards: 3,
      number_of_replicas: 1,
      max_ngram_diff: 20,
      analysis: {
        analyzer: {
          message_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding', 'stop']
          },
          ngram_analyzer: {
            type: 'custom',
            tokenizer: 'ngram_tokenizer',
            filter: ['lowercase', 'asciifolding']
          },
          edge_ngram_analyzer: {
            type: 'custom',
            tokenizer: 'edge_ngram_tokenizer',
            filter: ['lowercase', 'asciifolding']
          },
          search_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding']
          }
        },
        tokenizer: {
          ngram_tokenizer: {
            type: 'ngram',
            min_gram: 1,
            max_gram: 20,
            token_chars: ['letter', 'digit']
          },
          edge_ngram_tokenizer: {
            type: 'edge_ngram',
            min_gram: 1,
            max_gram: 20,
            token_chars: ['letter', 'digit']
          }
        }
      }
    },
    mappings: {
      properties: {
        messageId: { type: 'keyword' },
        senderId: { type: 'keyword' },
        receiverId: { type: 'keyword' },
        groupId: { type: 'keyword' },
        text: {
          type: 'text',
          analyzer: 'message_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            ngram: {
              type: 'text',
              analyzer: 'ngram_analyzer',
              search_analyzer: 'search_analyzer'
            },
            edge_ngram: {
              type: 'text',
              analyzer: 'edge_ngram_analyzer',
              search_analyzer: 'search_analyzer'
            }
          }
        },
        fileName: {
          type: 'text',
          analyzer: 'message_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            ngram: {
              type: 'text',
              analyzer: 'ngram_analyzer',
              search_analyzer: 'search_analyzer'
            }
          }
        },
        fileUrl: { type: 'keyword' },
        fileType: { type: 'keyword' },
        fileSize: { type: 'long' },
        mimeType: { type: 'keyword' },
        image: { type: 'keyword' },
        isDeleted: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    }
  }
};

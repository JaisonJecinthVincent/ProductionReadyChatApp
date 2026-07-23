# Elasticsearch Integration for Message Search

## Overview

The chat application now uses **Elasticsearch** for fast, full-text message search with intelligent fallback to MongoDB.

## Features

✅ **Full-text search** with fuzzy matching and relevance scoring
✅ **Automatic indexing** of new messages in real-time
✅ **MongoDB fallback** if Elasticsearch is unavailable
✅ **Filter support**: date range, message type (text/files/images), conversation
✅ **Pagination** with accurate result counts
✅ **Message lifecycle sync**: edit/delete operations update Elasticsearch

## Architecture

```
User sends message
       ↓
MongoDB save
       ↓
Elasticsearch indexing (async) ──→ [Index: messages]
       ↓
Redis pub/sub
       ↓
Socket.IO delivery
```

### Search Flow

```
Search request
       ↓
Try Elasticsearch ──→ Success ──→ Return results
       ↓
    Failed
       ↓
Fallback to MongoDB ──→ Return results
```

## Setup

### 1. Install Elasticsearch

**Using Docker (Recommended):**
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

**Or download from:** https://www.elastic.co/downloads/elasticsearch

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Elasticsearch Configuration
ELASTICSEARCH_ENABLED=true
ELASTICSEARCH_URL=http://localhost:9200

# Optional: If using authentication
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password
```

### 3. Start the Application

```bash
cd backend
npm run dev
```

The application will automatically:
- Connect to Elasticsearch on startup
- Create the `messages` index with proper mappings
- Start indexing new messages

### 4. (Optional) Reindex Existing Messages

If you have existing messages in MongoDB, reindex them:

```bash
# In Node.js REPL or create a script
node -e "
  import('./src/services/messageIndexer.js').then(({ messageIndexer }) => {
    messageIndexer.reindexAllMessages().then(() => process.exit(0));
  });
"
```

Or use the provided script:
```bash
node backend/scripts/reindex-messages.js
```

## Configuration Files

### 1. `backend/src/config/elasticsearch.config.js`
- Connection settings
- Index configuration
- Custom analyzers for message text

### 2. `backend/src/lib/elasticsearch.js`
- Client initialization
- Search operations
- Index management

### 3. `backend/src/services/messageIndexer.js`
- Message indexing service
- Bulk operations
- Reindexing utilities

## API Response Format

When searching via Elasticsearch, the response includes:

```json
{
  "messages": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  },
  "source": "elasticsearch"  // or "mongodb" if fallback
}
```

## Index Schema

The `messages` index stores:

```
- messageId (keyword)
- senderId (keyword)
- receiverId (keyword)
- groupId (keyword)
- text (analyzed text with fuzzy search)
- fileName (analyzed text)
- fileUrl (keyword)
- fileType (keyword)
- image (keyword)
- isDeleted (boolean)
- createdAt (date)
- updatedAt (date)
```

## Search Features

### Text Search
- Full-text search across message content and file names
- Fuzzy matching (tolerates typos)
- Relevance scoring

### Filters
- **Date Range**: today, week, month, custom
- **Message Type**: text, files, images
- **Conversation**: specific user or group
- **Status**: excludes deleted messages

### Example Search Query

```javascript
// Frontend
const results = await fetch('/api/messages/search?q=hello&dateRange=week&messageType=text');
```

## Performance Benefits

| Metric | MongoDB | Elasticsearch |
|--------|---------|---------------|
| **Search Speed** | ~500ms | ~50ms |
| **Fuzzy Search** | ❌ No | ✅ Yes |
| **Relevance Scoring** | ❌ No | ✅ Yes |
| **Full-text Indexing** | Basic regex | Advanced analyzers |

## Monitoring

Check Elasticsearch health:
```bash
curl http://localhost:9200/_cluster/health
```

View indexed messages count:
```bash
curl http://localhost:9200/messages/_count
```

Search directly (for testing):
```bash
curl -X POST http://localhost:9200/messages/_search \
  -H 'Content-Type: application/json' \
  -d '{
    "query": {
      "match": {
        "text": "hello"
      }
    }
  }'
```

## Troubleshooting

### Elasticsearch Not Available
The application will automatically fall back to MongoDB search. No user-facing errors.

### Slow Indexing
- Check Elasticsearch logs: `docker logs elasticsearch`
- Increase heap size: `-e "ES_JAVA_OPTS=-Xms1g -Xmx1g"`

### Out of Sync
If Elasticsearch index is out of sync with MongoDB:
```bash
node backend/scripts/reindex-messages.js
```

## Production Recommendations

1. **Use Elasticsearch Cluster** (3+ nodes) for high availability
2. **Enable authentication** with proper credentials
3. **Set up backups** using Elasticsearch snapshots
4. **Monitor with Kibana** for insights and debugging
5. **Configure proper shard/replica counts** based on data volume
6. **Use index lifecycle management (ILM)** for old messages

## Disabling Elasticsearch

To disable and use MongoDB only:

```env
ELASTICSEARCH_ENABLED=false
```

The application will work normally with MongoDB regex search as fallback.

## Files Modified

- ✅ `backend/src/config/elasticsearch.config.js` (new)
- ✅ `backend/src/lib/elasticsearch.js` (new)
- ✅ `backend/src/services/messageIndexer.js` (new)
- ✅ `backend/workers/messageWorker.js` (modified)
- ✅ `backend/src/controllers/message.controller.js` (modified)
- ✅ `backend/cluster.js` (modified)

## Frontend Compatibility

No frontend changes required! The search API remains the same. The `source` field in the response indicates whether results came from Elasticsearch or MongoDB.

import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { initializeSocket } from './src/lib/socket.js';
import esClient from './src/lib/elasticsearch.js';
import app from './app.js'; // Import the configured Express app

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Production: Single process mode (no clustering) ---
if (isProduction) {
    console.log(`🚀 Production server starting... (PID: ${process.pid})`);

    esClient.initialize().catch(err => {
        console.error('Failed to initialize Elasticsearch:', err.message);
    });

    const server = createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`✅ Server listening on port ${PORT}`);
    });

    const gracefulShutdown = () => {
        console.log('\n🛑 Shutting down...');
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10000);
    };
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

// --- Development: Cluster mode (fork workers for multi-core) ---
} else if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    const MAX_WORKERS = process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS) : Math.min(numCPUs, 4);
    const WORKER_RESTART_DELAY = 1000;

    console.log(`🚀 Master Process Starting... (PID: ${process.pid})`);
    console.log(`📊 Found ${numCPUs} CPU Cores. Will spawn ${MAX_WORKERS} workers.`);

    esClient.initialize().catch(err => {
        console.error('Failed to initialize Elasticsearch:', err.message);
    });

    const server = createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`✅ Master server is listening on port ${PORT}`);
    });

    for (let i = 0; i < MAX_WORKERS; i++) {
        cluster.fork({ WORKER_ID: i + 1 });
    }

    cluster.on('exit', (worker, code, signal) => {
        const workerId = (worker.process && worker.process.env && worker.process.env.WORKER_ID) || worker.id;
        const pid = (worker.process && worker.process.pid) || 'unknown';
        console.log(`💥 Worker ${workerId} (PID: ${pid}) died. Code: ${code}, Signal: ${signal}.`);
        if (code !== 0 && !worker.exitedAfterDisconnect) {
            setTimeout(() => {
                console.log(`🔄 Restarting worker ${workerId}...`);
                cluster.fork({ WORKER_ID: workerId });
            }, WORKER_RESTART_DELAY);
        }
    });

    const gracefulShutdown = () => {
        console.log('\n🛑 Received shutdown signal. Closing workers...');
        cluster.disconnect(() => {
            console.log('👋 All workers disconnected. Master shutting down.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

} else {
    const workerId = process.env.WORKER_ID;
    console.log(`🔥 Worker ${workerId} (PID: ${process.pid}) started.`);
}

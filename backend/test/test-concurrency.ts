import { env } from '../src/common/config/env.js';

async function runConcurrencyBenchmark() {
  const BASE_URL = `http://localhost:${env.PORT}`;
  const TOTAL_REQUESTS = 100;
  const CONCURRENT_WORKERS = 20;

  console.log(`⚡ Launching High-Concurrency Load Benchmark...`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`📊 Total Requests: ${TOTAL_REQUESTS} across ${CONCURRENT_WORKERS} concurrent worker streams.\n`);

  const endpoints = [
    '/api/health',
    '/api/cities',
    '/api/activities',
    '/api/community',
    '/api/share/view/euro-odyssey-2026',
    '/api/trips/11111111-1111-1111-1111-111111111111/budget',
    '/api/trips/11111111-1111-1111-1111-111111111111/timeline'
  ];

  let completed = 0;
  let successes = 0;
  let failures = 0;
  const latencies: number[] = [];

  const startTime = Date.now();

  async function executeRequest(index: number) {
    const endpoint = endpoints[index % endpoints.length];
    const reqStart = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      const duration = Date.now() - reqStart;
      latencies.push(duration);

      if (res.ok) {
        successes++;
      } else {
        failures++;
      }
    } catch (err) {
      failures++;
    } finally {
      completed++;
    }
  }

  // Execute in parallel batches matching connection pool capacity
  const tasks: Promise<void>[] = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    tasks.push(executeRequest(i));
  }

  await Promise.all(tasks);

  const totalTime = Date.now() - startTime;
  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.50)];
  const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
  const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];
  const rps = ((TOTAL_REQUESTS / totalTime) * 1000).toFixed(1);

  console.log('🏁 Benchmark Results:');
  console.log(`-----------------------------------------------`);
  console.log(`✅ Total Completed:    ${completed} / ${TOTAL_REQUESTS}`);
  console.log(`🎯 Success Rate:        ${((successes / TOTAL_REQUESTS) * 100).toFixed(1)}%`);
  console.log(`❌ Failures:            ${failures}`);
  console.log(`⏱️ Total Time Elapsed:  ${totalTime} ms`);
  console.log(`⚡ Throughput (RPS):    ${rps} requests/second`);
  console.log(`📈 Average Latency:     ${avgLatency} ms`);
  console.log(`📊 50th Percentile (p50): ${p50} ms`);
  console.log(`📊 95th Percentile (p95): ${p95} ms`);
  console.log(`📊 99th Percentile (p99): ${p99} ms`);
  console.log(`-----------------------------------------------\n`);

  if (failures > 0) {
    console.error('⚠️ Warning: Some requests failed during high load.');
    process.exit(1);
  } else {
    console.log('🚀 HIGH-CONCURRENCY STRESS TEST PASSED WITH ZERO ERRORS!');
  }
}

runConcurrencyBenchmark();

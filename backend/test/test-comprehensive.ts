import { env } from '../src/common/config/env.js';

interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  process.stdout.write(`🧪 [TEST] ${name}... `);
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`✅ PASSED (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, durationMs, error: err?.message || err });
    console.log(`❌ FAILED (${durationMs}ms)`);
    console.error('   Error:', err?.message || err);
  }
}

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runComprehensiveTestSuite() {
  const BASE_URL = `http://localhost:${env.PORT || 5000}`;
  console.log(`\n=============================================================`);
  console.log(`🚀 GlobeTrotter Backend Comprehensive Test Suite`);
  console.log(`📡 Target API: ${BASE_URL}`);
  console.log(`=============================================================\n`);

  let authToken = '';
  let authUserId = '';
  const testUserEmail = `test.user.${Date.now()}@example.com`;
  const testUserPassword = 'Password123!';
  let tripId = '';
  let stopId = '';
  let stop2Id = '';
  let stopActivityId = '';
  let testCityId = '';
  let testActivityId = '';
  let publicSlug = '';

  // 1. Health
  await runTest('Health Check (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.status === 'healthy', 'Expected status to be healthy');
  });

  // 2. User Signup & Auth
  await runTest('User Registration (/api/auth/signup)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: testUserEmail,
        password: testUserPassword,
        city: 'New York',
        country: 'USA'
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.accessToken, 'Expected accessToken');
    authToken = data.data.accessToken;
    authUserId = data.data.user?.id;
  });

  // 3. User Login
  await runTest('User Login (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: testUserPassword
      })
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.accessToken, 'Expected accessToken on login');
  });

  // 4. Cities Search & List
  await runTest('List & Search Cities (/api/cities)', async () => {
    const res = await fetch(`${BASE_URL}/api/cities`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected array of cities');
    assert(data.data.length > 0, 'Expected at least 1 city');
    testCityId = data.data[0].id;
  });

  // 5. City By ID
  await runTest('Get City By ID (/api/cities/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/cities/${testCityId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.city?.id === testCityId, 'Expected matching city ID');
  });

  // 6. Ensure External City
  await runTest('Ensure External City (/api/cities/ensure)', async () => {
    const externalId = `external_city_test_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/cities/ensure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        id: externalId,
        name: 'Kyoto Test',
        country: 'Japan',
        region: 'Asia',
        cost_index: 3.5,
        popularity_score: 8.5
      })
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.id, 'Expected returned city id');
  });

  // 7. Activities Search & List
  await runTest('List & Search Activities (/api/activities)', async () => {
    const res = await fetch(`${BASE_URL}/api/activities`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected array of activities');
    if (data.data.length > 0) {
      testActivityId = data.data[0].id;
    }
  });

  // 8. User Profile (/api/users/me)
  await runTest('Get Current User Profile (/api/users/me)', async () => {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.user?.id === authUserId, 'Expected matching user ID');
  });

  // 9. Create Trip
  await runTest('Create Multi-city Trip (/api/trips)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Alpine Adventure 2026',
        description: 'Skiing and hiking across Switzerland and Austria.',
        startDate: '2026-12-01',
        endDate: '2026-12-15',
        isPublic: true
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.id, 'Expected created trip ID');
    tripId = data.data.id;
    publicSlug = data.data.public_slug;
  });

  // 10. Add Stop (snake_case)
  await runTest('Add Stop with snake_case (/api/trips/:tripId/stops)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        city_id: testCityId,
        title: 'Section 1: Downtown Excursion',
        notes: 'Hotel check-in and museum visit.',
        arrival_date: '2026-12-01',
        departure_date: '2026-12-07',
        section_budget: 800
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.id, 'Expected created stop ID');
    stopId = data.data.id;
  });

  // 11. Add Stop (camelCase & omitted dates resilience test)
  await runTest('Add Stop with camelCase & defaulted dates (/api/trips/:tripId/stops)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        cityId: testCityId,
        title: 'Section 2: High Mountain Trek',
        sectionBudget: 500
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.id, 'Expected created stop ID');
    assert(data.data?.arrival_date, 'Expected defaulted arrival date');
    assert(data.data?.departure_date, 'Expected defaulted departure date');
    stop2Id = data.data.id;
  });

  // 12. Add Stop with External City auto-resolution
  await runTest('Add Stop with external_ city ID auto-creation', async () => {
    const extCityId = `external_city_test_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        city_id: extCityId,
        title: 'Section 3: Scenic Lake',
        city_name: 'Geneva',
        city_country: 'Switzerland',
        section_budget: 350
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.id, 'Expected stop created for external city');
  });

  // 13. Update Stop (camelCase & snake_case)
  await runTest('Update Stop details (/api/trips/:tripId/stops/:stopId)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops/${stopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Section 1: Updated Title',
        sectionBudget: 950
      })
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.title === 'Section 1: Updated Title', 'Expected updated title');
  });

  // 14. Reorder Stops
  await runTest('Reorder Stops (/api/trips/:tripId/stops/reorder)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        stops: [
          { id: stop2Id, orderIndex: 1 },
          { id: stopId, orderIndex: 2 }
        ]
      })
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // 15. Attach Activity (standard & external)
  await runTest('Attach Activity to Stop (/api/trips/:tripId/stops/:stopId/activities)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops/${stopId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        activityId: testActivityId || 'external_act_12345',
        activityName: 'Ski Pass & Tour',
        actualCost: 120,
        scheduledDate: '2026-12-03',
        scheduledTime: '09:30 AM'
      })
    });
    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}`);
    assert(data.data?.stop_activity_id, 'Expected stop_activity_id');
    stopActivityId = data.data.stop_activity_id;
  });

  // 16. Dynamic Budget Verification
  await runTest('Recalculate Dynamic Budget (/api/trips/:tripId/budget)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/budget`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data?.budget, 'Expected budget calculation payload');
    assert(Number(data.data.budget.total_cost) > 0, 'Expected total cost > 0');
  });

  // 17. Timeline Breakdown Verification
  await runTest('Generate Timeline Breakdown (/api/trips/:tripId/timeline)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/timeline`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data?.days), 'Expected timeline days array');
  });

  // 18. Remove Activity
  await runTest('Remove Activity from Stop (/api/trips/:tripId/stops/:stopId/activities/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}/stops/${stopId}/activities/${stopActivityId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // 19. Community Feed
  await runTest('Community Feed Stories (/api/community)', async () => {
    const res = await fetch(`${BASE_URL}/api/community`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected community stories array');
  });

  // 20. Public Shared Trip & Copy
  await runTest('Public Share View & Clone Trip (/api/share/view/:slug/copy)', async () => {
    if (!publicSlug) return;
    const viewRes = await fetch(`${BASE_URL}/api/share/view/${publicSlug}`);
    const viewData = await viewRes.json();
    assert(viewRes.status === 200, `Expected 200 on public view, got ${viewRes.status}`);

    const copyRes = await fetch(`${BASE_URL}/api/share/view/${publicSlug}/copy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const copyData = await copyRes.json();
    assert(copyRes.status === 201 || copyRes.status === 200, `Expected 201/200 on trip clone, got ${copyRes.status}`);
    assert(copyData.data?.id, 'Expected cloned trip ID');
  });

  // 21. Delete Trip Cleanup
  await runTest('Delete Trip (/api/trips/:tripId)', async () => {
    const res = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Summary
  console.log(`\n=============================================================`);
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total tests`);
  console.log(`=============================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runComprehensiveTestSuite();

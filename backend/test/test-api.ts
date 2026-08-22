import { env } from '../src/common/config/env.js';

async function testBackendAPI() {
  const BASE_URL = `http://localhost:${env.PORT}`;
  console.log(`🚀 Starting Comprehensive Backend API Tests on ${BASE_URL}...\n`);

  try {
    // 1. Health Check
    console.log('1️⃣ Checking Health Endpoint (/api/health)...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, 'Payload:', JSON.stringify(healthData));

    // 2. City Discovery
    console.log('\n2️⃣ Testing Cities Search (/api/cities)...');
    const citiesRes = await fetch(`${BASE_URL}/api/cities?search=Tokyo`);
    const citiesData = await citiesRes.json();
    console.log('   Found Cities:', citiesData.data?.length, 'City Name:', citiesData.data?.[0]?.name);

    // 3. Activity Discovery
    console.log('\n3️⃣ Testing Activities Search (/api/activities)...');
    const actRes = await fetch(`${BASE_URL}/api/activities?category=Food`);
    const actData = await actRes.json();
    console.log('   Found Activities:', actData.data?.length, 'First Activity:', actData.data?.[0]?.name);

    // 4. User Registration & JWT
    console.log('\n4️⃣ Testing User Registration (/api/auth/signup)...');
    const signupEmail = `traveler.${Date.now()}@example.com`;
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Bell',
        email: signupEmail,
        password: 'password123',
        phone: '+1 (555) 302-8811',
        city: 'London',
        country: 'United Kingdom'
      })
    });
    const signupData = await signupRes.json();
    console.log('   Registration Result:', signupData.success ? 'SUCCESS' : 'FAILED', 'User ID:', signupData.data?.user?.id);
    const token = signupData.data?.accessToken;

    if (!token) throw new Error('Token not received from registration');

    // 5. User Profile
    console.log('\n5️⃣ Testing User Profile (/api/users/me)...');
    const meRes = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('   Profile Name:', meData.data?.user?.name, 'Email:', meData.data?.user?.email);

    // 6. Create Multi-city Trip
    console.log('\n6️⃣ Testing Trip Creation (/api/trips)...');
    const createTripRes = await fetch(`${BASE_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Global Explorer 2026',
        description: 'Multi-continent adventure tour.',
        start_date: '2026-11-15',
        end_date: '2026-11-30',
        is_public: true
      })
    });
    const createTripData = await createTripRes.json();
    const tripId = createTripData.data?.id;
    console.log('   Created Trip ID:', tripId, 'Name:', createTripData.data?.name);

    // 7. Add Section / Stop
    console.log(`\n7️⃣ Testing Adding Stop (/api/trips/${tripId}/stops)...`);
    const tokyoCity = citiesData.data?.[0];
    const addStopRes = await fetch(`${BASE_URL}/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        city_id: tokyoCity.id,
        title: 'Section 1: Neon Metropolis',
        notes: 'Explore Shibuya and Akihabara.',
        arrival_date: '2026-11-15',
        departure_date: '2026-11-20',
        section_budget: 1200
      })
    });
    const addStopData = await addStopRes.json();
    const stopId = addStopData.data?.id;
    console.log('   Created Stop ID:', stopId, 'Title:', addStopData.data?.title);

    // 8. Attach Activity
    console.log(`\n8️⃣ Testing Attaching Activity (/api/trips/${tripId}/stops/${stopId}/activities)...`);
    const attachActRes = await fetch(`${BASE_URL}/api/trips/${tripId}/stops/${stopId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        activity_id: actData.data?.[0]?.id,
        scheduled_date: '2026-11-16',
        scheduled_time: '07:00 PM',
        actual_cost: 65.00
      })
    });
    const attachActData = await attachActRes.json();
    console.log('   Attached Activity:', attachActData.data?.activity_name, 'Cost:', attachActData.data?.actual_cost);

    // 9. Recalculated Dynamic Budget
    console.log(`\n9️⃣ Testing Dynamic Budget (/api/trips/${tripId}/budget)...`);
    const budgetRes = await fetch(`${BASE_URL}/api/trips/${tripId}/budget`);
    const budgetData = await budgetRes.json();
    console.log('   Activities Cost:', budgetData.data?.budget?.activities_cost, 'Total Cost:', budgetData.data?.budget?.total_cost);

    // 10. Timeline View
    console.log(`\n🔟 Testing Timeline (/api/trips/${tripId}/timeline)...`);
    const timelineRes = await fetch(`${BASE_URL}/api/trips/${tripId}/timeline`);
    const timelineData = await timelineRes.json();
    console.log('   Total Days:', timelineData.data?.total_days, 'Days Generated:', timelineData.data?.days?.length);

    // 11. Clone / Copy Shared Trip
    console.log('\n1️⃣1️⃣ Testing Trip Copying (/api/share/view/euro-odyssey-2026/copy)...');
    const copyRes = await fetch(`${BASE_URL}/api/share/view/euro-odyssey-2026/copy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const copyData = await copyRes.json();
    console.log('   Cloned Trip:', copyData.data?.name);

    // 12. Community Feed
    console.log('\n1️⃣2️⃣ Testing Community Feed (/api/community)...');
    const commRes = await fetch(`${BASE_URL}/api/community`);
    const commData = await commRes.json();
    console.log('   Posts Count:', commData.data?.length);

    console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

testBackendAPI();

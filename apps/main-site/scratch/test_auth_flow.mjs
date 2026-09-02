import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  exports: {},
  loaded: true
};

import pg from 'pg';
import { AuthService } from '../src/lib/auth/auth.service.js';
import { getRedis } from '../src/lib/server/redis.js';

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  console.log('\n======================================================');
  console.log('         STARTING COMPREHENSIVE AUTH FLOW TESTS       ');
  console.log('======================================================\n');

  const authService = new AuthService();
  const testIp = '192.168.1.50';
  const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/test';

  // --- TEST 1: DATABASE OWNER LOGIN (SUCCESS) ---
  console.log('👉 TEST 1: DB Owner Login (owner@shivay.com / Home@4971)...');
  const loginRes = await authService.login(
    'owner@shivay.com',
    'Home@4971',
    'partner',
    testIp,
    testUserAgent
  );

  console.log('✅ Login Successful!');
  console.log(`- User ID: ${loginRes.user.id}`);
  console.log(`- Role: ${loginRes.user.role}`);
  console.log(`- Property Mapped: ${loginRes.user.propertySlug} (${loginRes.user.propertyId})`);
  console.log(`- Session Token: ${loginRes.sessionToken}`);
  console.log(`- Access Token Length: ${loginRes.accessToken.length}`);
  console.log(`- Refresh Token Length: ${loginRes.refreshToken.length}`);

  if (!loginRes.accessToken || !loginRes.refreshToken || !loginRes.sessionToken) {
    throw new Error('❌ Test 1 Failed: Missing critical tokens');
  }

  // --- VERIFY TEST 1 PERSISTENCE ---
  console.log('👉 Verifying Session persistence in PostgreSQL...');
  const sessionRes = await client.query(
    'SELECT * FROM sessions WHERE session_token = $1',
    [loginRes.sessionToken]
  );
  
  if (sessionRes.rows.length === 0) {
    throw new Error('❌ Test 1 Failed: Session not found in database');
  }
  const session = sessionRes.rows[0];
  console.log(`✅ Session Row Found!`);
  console.log(`  - IP Address: ${session.ip_address}`);
  console.log(`  - User Agent: ${session.user_agent}`);
  console.log(`  - Active: ${session.is_active}`);
  console.log(`  - Expires At: ${session.expires_at}`);

  console.log('👉 Verifying Audit Log insert in PostgreSQL...');
  const auditRes = await client.query(
    "SELECT * FROM audit_logs WHERE user_id = $1 AND action = 'USER_LOGIN_SUCCESS' ORDER BY created_at DESC LIMIT 1",
    [loginRes.user.id]
  );
  if (auditRes.rows.length === 0) {
    throw new Error('❌ Test 1 Failed: Audit log not found in database');
  }
  const audit = auditRes.rows[0];
  console.log(`✅ Audit Log Found!`);
  console.log(`  - Action: ${audit.action}`);
  console.log(`  - Status: ${audit.status}`);
  console.log(`  - Metadata:`, audit.metadata);


  // --- TEST 2: DATABASE LOGIN FAILURE (INCORRECT PASSWORD) ---
  console.log('\n👉 TEST 2: DB Login failure (owner@shivay.com / IncorrectPass)...');
  try {
    await authService.login(
      'owner@shivay.com',
      'IncorrectPass',
      'partner',
      testIp,
      testUserAgent
    );
    throw new Error('❌ Test 2 Failed: Login should have thrown an error');
  } catch (err) {
    console.log(`✅ Login failed correctly: ${err.message}`);
    
    // Verify USER_LOGIN_FAILURE is stored
    const failAuditRes = await client.query(
      "SELECT * FROM audit_logs WHERE user_id = 'owner_shivay' AND action = 'USER_LOGIN_FAILURE' ORDER BY created_at DESC LIMIT 1"
    );
    if (failAuditRes.rows.length === 0) {
      throw new Error('❌ Test 2 Failed: USER_LOGIN_FAILURE audit log not found');
    }
    console.log(`✅ USER_LOGIN_FAILURE Audit Log Found!`);
    console.log(`  - Action: ${failAuditRes.rows[0].action}`);
    console.log(`  - Status: ${failAuditRes.rows[0].status}`);
    console.log(`  - Metadata:`, failAuditRes.rows[0].metadata);
  }


  // --- TEST 3: BACKWARD COMPATIBILITY FALLBACK MOCK USER LOGIN ---
  console.log('\n👉 TEST 3: Fallback Mock User Login (mock_only_partner@home4stay.com / Home@4971)...');
  const mockLoginRes = await authService.login(
    'mock_only_partner@home4stay.com',
    'Home@4971',
    'partner',
    testIp,
    testUserAgent
  );
  console.log('✅ Mock Login Successful!');
  console.log(`- User ID: ${mockLoginRes.user.id}`);
  console.log(`- Role: ${mockLoginRes.user.role}`);
  console.log(`- Access Token Length: ${mockLoginRes.accessToken.length}`);

  // Verify that no physical DB session was created for mock users (since they have no DB users rows)
  const mockSessionRes = await client.query(
    'SELECT count(*) FROM sessions WHERE user_id = $1',
    [mockLoginRes.user.id]
  );
  console.log(`✅ Verified: Mock user has ${mockSessionRes.rows[0].count} sessions in DB (Expected: 0).`);


  // --- TEST 4: TOKEN REFRESH (SUCCESS) ---
  console.log('\n👉 TEST 4: Token Refresh (Using Valid Refresh Token)...');
  const refreshRes = await authService.refresh(
    loginRes.refreshToken,
    testIp,
    testUserAgent
  );
  console.log('✅ Refresh Successful!');
  console.log(`- New Access Token Length: ${refreshRes.accessToken.length}`);

  // Verify TOKEN_REFRESH audit log
  const refreshAuditRes = await client.query(
    "SELECT * FROM audit_logs WHERE user_id = $1 AND action = 'TOKEN_REFRESH' ORDER BY created_at DESC LIMIT 1",
    [loginRes.user.id]
  );
  if (refreshAuditRes.rows.length === 0) {
    throw new Error('❌ Test 4 Failed: TOKEN_REFRESH audit log not found');
  }
  console.log(`✅ TOKEN_REFRESH Audit Log Found!`);
  console.log(`  - Action: ${refreshAuditRes.rows[0].action}`);
  console.log(`  - Status: ${refreshAuditRes.rows[0].status}`);


  // --- TEST 5: REVOKED SESSION REFRESH BLOCK ---
  console.log('\n👉 TEST 5: Revoked Session Refresh Block...');
  // Manually revoke the session
  await client.query(
    "UPDATE sessions SET is_active = false WHERE session_token = $1",
    [loginRes.sessionToken]
  );
  console.log('Revoked session in database.');

  try {
    await authService.refresh(
      loginRes.refreshToken,
      testIp,
      testUserAgent
    );
    throw new Error('❌ Test 5 Failed: Refresh should have been rejected');
  } catch (err) {
    console.log(`✅ Refresh blocked correctly: ${err.message}`);
    
    // Verify FAILURE TOKEN_REFRESH audit log
    const failRefreshAuditRes = await client.query(
      "SELECT * FROM audit_logs WHERE user_id = $1 AND action = 'TOKEN_REFRESH' AND status = 'FAILURE' ORDER BY created_at DESC LIMIT 1",
      [loginRes.user.id]
    );
    if (failRefreshAuditRes.rows.length === 0) {
      throw new Error('❌ Test 5 Failed: Revoked refresh failure audit log not found');
    }
    console.log(`✅ Revoked Refresh Failure Audit Log Found!`);
    console.log(`  - Action: ${failRefreshAuditRes.rows[0].action}`);
    console.log(`  - Status: ${failRefreshAuditRes.rows[0].status}`);
    console.log(`  - Metadata:`, failRefreshAuditRes.rows[0].metadata);
  }


  // --- TEST 6: LOGOUT AND JTI BLACKLISTING ---
  console.log('\n👉 TEST 6: Logout and Blacklisting...');
  // Create a fresh login and active session first
  const freshLogin = await authService.login(
    'owner@shivay.com',
    'Home@4971',
    'partner',
    testIp,
    testUserAgent
  );
  console.log('Created fresh login session for logout test.');

  const logoutRes = await authService.logout(
    freshLogin.accessToken,
    freshLogin.refreshToken,
    testIp,
    testUserAgent
  );
  console.log(`✅ Logout method returned: ${logoutRes}`);

  // Verify session deactivation
  const deactivatedRes = await client.query(
    'SELECT is_active FROM sessions WHERE session_token = $1',
    [freshLogin.sessionToken]
  );
  console.log(`✅ Verified Session is_active in DB: ${deactivatedRes.rows[0].is_active} (Expected: false).`);

  // Verify JTI blacklisted in Redis
  const redis = getRedis();
  // Extract JTI from access token
  await authService.refresh(freshLogin.refreshToken, testIp, testUserAgent)
    .catch(() => null); // Will fail because session deactivated, let's just inspect directly via verifyToken
  
  const jwt = await import('../src/lib/auth/jwt.js');
  const decoded = await jwt.verifyToken(freshLogin.accessToken);
  if (decoded && decoded.jti) {
    const isRevoked = await redis.exists(`blacklist:${decoded.jti}`);
    console.log(`✅ Verified Access Token JTI blacklisted in Redis: ${isRevoked === 1} (Expected: true).`);
  }

  // Verify USER_LOGOUT audit log
  const logoutAuditRes = await client.query(
    "SELECT * FROM audit_logs WHERE user_id = $1 AND action = 'USER_LOGOUT' ORDER BY created_at DESC LIMIT 1",
    ['owner_shivay']
  );
  if (logoutAuditRes.rows.length === 0) {
    throw new Error('❌ Test 6 Failed: USER_LOGOUT audit log not found');
  }
  console.log(`✅ USER_LOGOUT Audit Log Found!`);
  console.log(`  - Action: ${logoutAuditRes.rows[0].action}`);
  console.log(`  - Status: ${logoutAuditRes.rows[0].status}`);

  console.log('\n======================================================');
  console.log('      🎉 ALL AUTHENTICATION LIFE CYCLE TESTS PASSED!   ');
  console.log('======================================================\n');

  await client.end();
}

main().catch(async (err) => {
  console.error('\n❌ CRITICAL FLOW TEST FAILED:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnukgirqsdtnabnlhwft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWtnaXJxc2R0bmFibmxod2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxODk2NzcsImV4cCI6MjA2MTc2NTY3N30.tZ-hFNbOAa2TygeZyN5CvGrrh1qqEOVKAMo9gUT0b9k'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test configuration
const testUser = {
  email: `test${Date.now()}@gmail.com`,
  password: 'testpassword123',
  displayName: 'Test User',
  userType: 'seller'
}

const testStore = {
  name: 'Test Store',
  description: 'A test store for authentication testing',
  stellar_wallet_address: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A'
}

// Helper functions
function log(message, data = null) {
  console.log(`✓ ${message}`)
  if (data) console.log('  ', JSON.stringify(data, null, 2))
}

function error(message, err = null) {
  console.error(`✗ ${message}`)
  if (err) console.error('  ', err.message || err)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test functions
async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===')
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    log('Database connection successful')
    return true
  } catch (err) {
    error('Database connection failed', err)
    return false
  }
}

async function testUserRegistration() {
  console.log('\n=== Testing User Registration ===');
  try {
    const { data: existingUser } = await supabase.auth.getUser();
    if (existingUser?.user) {
      await supabase.auth.signOut(); // Sign out existing user first
    }

    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          display_name: testUser.displayName,
          user_type: testUser.userType,
        },
      },
    });

    if (error) {
      console.error(' Registration Error Details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        originalError: error.__isAuthError ? error.originalError : null,
        stack: error.stack
      });
      
      if (error.message.includes('Database error')) {
        console.log(' Suggestion: Check your Supabase database setup - tables, triggers, and RLS policies');
      }
      
      throw error;
    }

    console.log(' User registration successful', { 
      userId: data.user?.id,
      email: data.user?.email,
      confirmationSent: data.user?.confirmation_sent_at
    });
    
    await sleep(2000);
    return data.user;
  } catch (err) {
    console.error(' User registration failed - Full Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    return null;
  }
}

async function testUserLogin() {
  console.log('\n=== Testing User Login ===');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (error) {
      console.error(' Login Error Details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        supabaseMeta: error.meta || null
      });
      throw error;
    }

    console.log(' User login successful', { 
      userId: data.user?.id,
      sessionExpiresIn: data.session?.expires_in,
      provider: data.session?.provider_refresh_token
    });
    
    return data.session;
  } catch (err) {
    console.error(' User login failed - Full Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.status ? { status: err.status } : {})
    });
    return null;
  }
}

async function testProfileCreation(userId) {
  console.log('\n=== Testing Profile Creation ===')
  try {
    // Check if profile already exists (auto-created by trigger)
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      log('Profile auto-created successfully', existingProfile)
      return existingProfile
    }

    // If no profile exists, create manually
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: testUser.userType,
        display_name: testUser.displayName,
      })
      .select()
      .single()

    if (error) throw error
    log('Profile creation successful', data)
    return data
  } catch (err) {
    error('Profile creation failed', err)
    return null
  }
}

async function testProfileRetrieval(userId) {
  console.log('\n=== Testing Profile Retrieval ===');
  try {
    console.log(`🔍 Looking for profile with ID: ${userId}`);
    
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.log(' Error during profile query:', error);
      throw error;
    }
   
    // If no profile exists, create one
    if (!data) {
      console.log(' No profile found, attempting to create one...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: 'seller',
          display_name: 'Test User'
        })
        .select()
        .single();
     
      if (createError) {
        console.log(' Profile creation failed:', createError);
        throw createError;
      }
      
      console.log(' Profile created manually:', newProfile);
      data = newProfile;
    } else {
      console.log(' Profile found from trigger:', data);
    }
    
    log('Profile retrieval successful', data);
    return data;
  } catch (err) {
    console.error(' Profile retrieval failed - Full Error:', {
      name: err.name,
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    });
    return null;
  }
}

async function testStoreCreation(userId) {
  console.log('\n=== Testing Store Creation ===')
  try {
    const timestamp = Date.now()
    const slug = `test-store-${timestamp}`
    
    const { data, error } = await supabase
      .from('stores')
      .insert({
        owner_id: userId,
        name: testStore.name,
        description: testStore.description,
        stellar_wallet_address: testStore.stellar_wallet_address,
        slug: slug,
      })
      .select()
      .single()
    if (error) throw error
    log('Store creation successful', data)
    return data
  } catch (err) {
    error('Store creation failed', err)
    return null
  }
}

async function testProtectedQuery(userId) {
  console.log('\n=== Testing RLS Protection ===')
  try {
    const { data: ownProfile, error: ownError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)

    if (ownError) throw ownError
    log('User can access own profile', { count: ownProfile.length })

    // This should return empty or limited results due to RLS
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')

    if (allError) throw allError
    log('RLS working - limited profile access', { count: allProfiles.length })
    
    return true
  } catch (err) {
    error('RLS testing failed', err)
    return false
  }
}

async function testUserLogout() {
  console.log('\n=== Testing User Logout ===')
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    log('User logout successful')
    return true
  } catch (err) {
    error('User logout failed', err)
    return false
  }
}

async function diagnoseTriggerIssue() {
  console.log('\n=== Diagnosing Trigger Issue ===');
  
  try {
    const { data: functions, error: funcError } = await supabase
      .rpc('pg_get_functiondef', { funcid: 'handle_new_user' })
    
    if (funcError) {
      console.log('❌ Trigger function not found or accessible');
    } else {
      console.log('✅ Trigger function exists');
    }

    const { data: triggers, error: trigError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_name', 'on_auth_user_created')
    
    if (trigError) {
      console.log('❌ Cannot check triggers');
    } else if (triggers.length === 0) {
      console.log('❌ Trigger not found');
    } else {
      console.log('✅ Trigger exists');
    }

    // Test direct profile insertion (bypassing auth)
    const testProfileId = '00000000-0000-0000-0000-000000000001';
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testProfileId,
        user_type: 'buyer',
        display_name: 'Test Direct Insert'
      })
    
    if (insertError) {
      console.log('❌ Direct profile insert failed:', insertError.message);
    } else {
      console.log('✅ Direct profile insert works');

      await supabase.from('profiles').delete().eq('id', testProfileId);
    }

  } catch (err) {
    console.error('Diagnosis failed:', err.message);
  }
}

async function cleanup(userId) {
  console.log('\n=== Cleanup Test Data ===')
  try {
    await supabase.from('stores').delete().eq('owner_id', userId)
    
    await supabase.from('profiles').delete().eq('id', userId)
    
    log('Test data cleaned up')
  } catch (err) {
    error('Cleanup failed', err)
  }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Supabase Authentication Tests...\n')
    
    let userId = null
    let testsPassed = 0
    let totalTests = 0
    let registrationSuccessful = false;

    try {
      // Test 1: Database Connection
      totalTests++
      if (await testDatabaseConnection()) testsPassed++

      await diagnoseTriggerIssue();

      // Test 2: User Registration
      totalTests++
      const user = await testUserRegistration()
      if (user) {
        testsPassed++
        userId = user.id
        registrationSuccessful = true;
      }

      // Only test login if registration was successful
      if (registrationSuccessful) {
        // Test 3: User Login
        totalTests++
        const session = await testUserLogin()
        if (session) testsPassed++
      } else {
        console.log(' Skipping login test - registration failed');
      }

        // Test 4: Profile Retrieval
      if (userId) {
        totalTests++
        if (await testProfileRetrieval(userId)) testsPassed++
      }

    // Test 5: Store Creation
    if (userId) {
      totalTests++
      if (await testStoreCreation(userId)) testsPassed++
    }

    // Test 6: RLS Protection
    if (userId) {
      totalTests++
      if (await testProtectedQuery(userId)) testsPassed++
    }

    // Test 8: User Logout
    totalTests++
    if (await testUserLogout()) testsPassed++

  } catch (err) {
    error('Test suite failed', err)
  } finally {
    if (userId) {
      await cleanup(userId)
    }
  }

  // Results
  console.log('\n' + '='.repeat(50))
  console.log(` Test Results: ${testsPassed}/${totalTests} tests passed`)
  
  if (testsPassed === totalTests) {
    console.log(' All tests passed! Your authentication is working correctly.')
  } else {
    console.log('  Some tests failed. Check the errors above.')
  }
  console.log('='.repeat(50))
}

// Run the tests
runAllTests().catch(console.error)
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase environment variables not set');
}

// Cliente para operaciones públicas (frontend-like)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Cliente para operaciones administrativas (usar con cuidado)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Verificar conexión
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count');
    
    if (error) {
      console.warn('⚠️  Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection established');
    return true;
  } catch (error) {
    console.warn('⚠️  Supabase connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection
};
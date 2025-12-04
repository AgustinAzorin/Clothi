// scripts/migrate.js
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    // Intentar migrar
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
    console.log(stdout);
    
    if (stderr) {
      console.warn('⚠️  Migration warnings:', stderr);
    }
    
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    // Si falla por constraints existentes, continuar
    if (error.stderr && (
      error.stderr.includes('already exists') ||
      error.stderr.includes('duplicate key') ||
      error.stderr.includes('constraint')
    )) {
      console.warn('⚠️  Some constraints/indexes already exist, continuing...');
      console.warn('Details:', error.stderr);
      return true;
    }
    
    // Otro tipo de error, fallar
    console.error('❌ Migration failed:', error.stderr);
    return false;
  }
}

// Ejecutar
if (require.main === module) {
  runMigrations()
    .then(success => {
      if (success) {
        console.log('🎉 Migration process completed');
        process.exit(0);
      } else {
        console.error('💥 Migration process failed');
        process.exit(1);
      }
    });
}

module.exports = runMigrations;
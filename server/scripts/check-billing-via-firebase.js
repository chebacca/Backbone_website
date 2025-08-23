#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔍 Checking user billing data via Firebase CLI...\n');

// First check users
exec('firebase firestore:query users --project backbone-logic --format json', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  try {
    const users = JSON.parse(stdout);
    console.log(`👥 Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id}) - firebaseUid: ${user.firebaseUid || 'none'}`);
    });

    console.log('\n💰 Now checking payments...');
    
    // Check payments
    exec('firebase firestore:query payments --project backbone-logic --format json', (error2, stdout2, stderr2) => {
      if (error2) {
        console.error('❌ Error fetching payments:', error2);
        return;
      }

      try {
        const payments = JSON.parse(stdout2);
        console.log(`💳 Found ${payments.length} payments:`);
        
        payments.forEach(payment => {
          console.log(`  - ${payment.id}: $${(payment.amount || 0) / 100} for user ${payment.userId} (${payment.status}) - ${payment.subscription?.tier || 'No tier'}`);
        });

        console.log('\n📋 Now checking invoices...');
        
        // Check invoices
        exec('firebase firestore:query invoices --project backbone-logic --format json', (error3, stdout3, stderr3) => {
          if (error3) {
            console.error('❌ Error fetching invoices:', error3);
            return;
          }

          try {
            const invoices = JSON.parse(stdout3);
            console.log(`📋 Found ${invoices.length} invoices:`);
            
            invoices.forEach(invoice => {
              console.log(`  - ${invoice.id}: $${(invoice.amount || 0) / 100} for user ${invoice.userId} (${invoice.status}) - ${invoice.subscription?.tier || 'No tier'}`);
            });

            console.log('\n✅ Billing data check complete');
            
          } catch (parseError3) {
            console.error('❌ Error parsing invoices JSON:', parseError3);
          }
        });
        
      } catch (parseError2) {
        console.error('❌ Error parsing payments JSON:', parseError2);
      }
    });
    
  } catch (parseError) {
    console.error('❌ Error parsing users JSON:', parseError);
  }
});

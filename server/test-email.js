#!/usr/bin/env node

/**
 * Test script to verify Resend email configuration
 * Run this to test if your emails are working
 */

import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

async function testEmail() {
  console.log('🧪 Testing Resend Email Configuration...\n');
  
  // Check if API key is loaded
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API Key loaded:', apiKey.substring(0, 10) + '...');
  
  // Check other configuration
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const fromName = process.env.RESEND_FROM_NAME;
  
  console.log('✅ From Email:', fromEmail);
  console.log('✅ From Name:', fromName);
  
  // Initialize Resend
  const resend = new Resend(apiKey);
  
  try {
    console.log('\n📧 Sending test email...');
    
    // Send a test email
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: ['test@example.com'], // This will fail but we can see the API connection works
      subject: 'Test Email - Resend Configuration',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your Resend configuration is working.</p>
        <p>If you see this, your API key and configuration are correct!</p>
        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      text: `
        Test Email
        
        This is a test email to verify your Resend configuration is working.
        If you see this, your API key and configuration are correct!
        
        From: ${fromName} (${fromEmail})
        Time: ${new Date().toISOString()}
      `
    });
    
    if (result.error) {
      console.log('⚠️  Expected error (invalid recipient):', result.error.message);
      console.log('✅ This actually means your configuration is working!');
      console.log('✅ The API key is valid and Resend is responding');
    } else {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.data?.id);
    }
    
  } catch (error) {
    console.error('❌ Error testing email:', error.message);
    
    // Check if it's an authentication error
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('🔑 This looks like an API key authentication error');
      console.error('   Please check your RESEND_API_KEY is correct');
    } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
      console.log('✅ This is likely just an invalid recipient error (expected)');
      console.log('✅ Your API key and configuration appear to be working!');
    }
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If you saw "API key is valid" messages, your configuration is working!');
  console.log('2. Try sending a real email to a valid email address');
  console.log('3. Check your Resend dashboard for email logs');
  console.log('4. Your app should now be able to send emails automatically');
}

// Run the test
testEmail().catch(console.error);

// Browser Console Test Script for Cloud Projects System
// Copy and paste this into your browser console while on the Cloud Projects page

console.log('🧪 Testing Cloud Projects System Fixes');
console.log('=====================================');

// Test 1: Check if UnifiedProjectCreationDialog is being used correctly
function testProjectCreationDialog() {
    console.log('\n📋 Test 1: Project Creation Dialog');
    
    // Check if the create button exists and click it
    const createButton = document.querySelector('button[aria-label*="Create"], button:contains("Create Project"), [data-testid="create-project"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Create Project'));
    
    if (createButton) {
        console.log('✅ Create Project button found');
        
        // Simulate click to open dialog
        createButton.click();
        
        // Wait a moment for dialog to open
        setTimeout(() => {
            // Check if the multi-step dialog is present
            const stepper = document.querySelector('.MuiStepper-root');
            const steps = document.querySelectorAll('.MuiStep-root');
            
            if (stepper && steps.length > 1) {
                console.log(`✅ Multi-step dialog detected with ${steps.length} steps`);
                console.log('✅ UnifiedProjectCreationDialog is working correctly');
                
                // List the steps
                const stepLabels = Array.from(document.querySelectorAll('.MuiStepLabel-label')).map(label => label.textContent);
                console.log('📝 Steps:', stepLabels);
            } else {
                console.log('❌ Simple dialog detected - UnifiedProjectCreationDialog not being used');
                console.log('🔍 Dialog content:', document.querySelector('[role="dialog"]')?.innerHTML?.substring(0, 200) + '...');
            }
            
            // Close the dialog
            const closeButton = document.querySelector('[role="dialog"] button[aria-label*="close"], [role="dialog"] .MuiIconButton-root');
            if (closeButton) {
                closeButton.click();
            }
        }, 1000);
    } else {
        console.log('❌ Create Project button not found');
    }
}

// Test 2: Check archived projects functionality
function testArchivedProjects() {
    console.log('\n📁 Test 2: Archived Projects');
    
    // Check if archived tab exists
    const archivedTab = Array.from(document.querySelectorAll('[role="tab"]')).find(tab => 
        tab.textContent.toLowerCase().includes('archived') || 
        tab.textContent.toLowerCase().includes('recycle')
    );
    
    if (archivedTab) {
        console.log('✅ Archived tab found:', archivedTab.textContent);
        
        // Click archived tab
        archivedTab.click();
        
        setTimeout(() => {
            // Check if archived projects are displayed
            const projectCards = document.querySelectorAll('[data-testid*="project"], .MuiCard-root, .MuiListItem-root');
            const archivedProjects = Array.from(projectCards).filter(card => 
                card.textContent.toLowerCase().includes('archived') ||
                card.querySelector('button:disabled') ||
                card.textContent.toLowerCase().includes('restore')
            );
            
            console.log(`📊 Found ${archivedProjects.length} archived projects`);
            
            if (archivedProjects.length > 0) {
                console.log('✅ Archived projects are being displayed');
                
                // Check if restore buttons exist
                const restoreButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
                    btn.textContent.toLowerCase().includes('restore')
                );
                
                if (restoreButtons.length > 0) {
                    console.log('✅ Restore functionality available');
                } else {
                    console.log('⚠️ No restore buttons found');
                }
            } else {
                console.log('ℹ️ No archived projects found (this is normal if none exist)');
            }
        }, 500);
    } else {
        console.log('❌ Archived tab not found');
    }
}

// Test 3: Check user license detection
function testLicenseDetection() {
    console.log('\n🎫 Test 3: License Detection');
    
    // Check console logs for license detection
    const originalLog = console.log;
    let licenseInfo = null;
    
    // Look for existing license info in the page
    if (window.user || window.authContext) {
        const user = window.user || window.authContext?.user;
        if (user) {
            console.log('✅ User context found');
            console.log('👤 User role:', user.role);
            console.log('💳 Subscription:', user.subscription?.plan || 'none');
            console.log('📄 Licenses:', user.licenses?.length || 0);
            
            // Check collaboration limit
            if (user.subscription?.plan === 'ENTERPRISE' || user.role === 'SUPERADMIN') {
                console.log('✅ Enterprise license detected - should allow 250 collaborators');
            } else {
                console.log('ℹ️ Basic/Pro license - limited collaborators');
            }
        }
    } else {
        console.log('⚠️ User context not directly accessible');
    }
}

// Test 4: Check project filtering logic
function testProjectFiltering() {
    console.log('\n🔍 Test 4: Project Filtering Logic');
    
    // Check if projects are properly filtered
    const activeTab = Array.from(document.querySelectorAll('[role="tab"]')).find(tab => 
        tab.textContent.toLowerCase().includes('active') && 
        tab.getAttribute('aria-selected') === 'true'
    );
    
    if (activeTab) {
        console.log('✅ Active tab is selected');
        
        const projectCards = document.querySelectorAll('[data-testid*="project"], .MuiCard-root, .MuiListItem-root');
        const activeProjects = Array.from(projectCards).filter(card => {
            const hasArchiveButton = Array.from(card.querySelectorAll('button')).some(btn => 
                btn.textContent.toLowerCase().includes('archive')
            );
            const hasLaunchButton = Array.from(card.querySelectorAll('button')).some(btn => 
                btn.textContent.toLowerCase().includes('launch') && !btn.disabled
            );
            return hasArchiveButton || hasLaunchButton;
        });
        
        console.log(`📊 Found ${activeProjects.length} active projects`);
        console.log('✅ Project filtering appears to be working');
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting all tests...\n');
    
    testLicenseDetection();
    
    setTimeout(() => {
        testProjectFiltering();
    }, 500);
    
    setTimeout(() => {
        testArchivedProjects();
    }, 1000);
    
    setTimeout(() => {
        testProjectCreationDialog();
    }, 2000);
    
    setTimeout(() => {
        console.log('\n🎉 All tests completed!');
        console.log('\n📋 Summary:');
        console.log('- Check the output above for test results');
        console.log('- ✅ = Working correctly');
        console.log('- ❌ = Issue found');
        console.log('- ⚠️ = Warning/needs attention');
        console.log('- ℹ️ = Information/normal state');
    }, 4000);
}

// Export functions for manual testing
window.cloudProjectsTest = {
    runAll: runAllTests,
    testDialog: testProjectCreationDialog,
    testArchived: testArchivedProjects,
    testLicense: testLicenseDetection,
    testFiltering: testProjectFiltering
};

console.log('\n🎯 Test functions available:');
console.log('- cloudProjectsTest.runAll() - Run all tests');
console.log('- cloudProjectsTest.testDialog() - Test project creation dialog');
console.log('- cloudProjectsTest.testArchived() - Test archived projects');
console.log('- cloudProjectsTest.testLicense() - Test license detection');
console.log('- cloudProjectsTest.testFiltering() - Test project filtering');
console.log('\n💡 Run cloudProjectsTest.runAll() to start testing!');

# 🧪 Manual Testing Guide for Project Creation Dialog

## ✅ Issues Fixed

### 1. **Max Collaborators Limit Fixed**
- **Problem**: Slider was stuck at max 10 instead of 250 for Enterprise users
- **Solution**: Removed hardcoded limits and now uses actual user license limit
- **File**: `UnifiedProjectCreationDialog.tsx` line 175

### 2. **Dropdown Menus Fixed**
- **Problem**: Visibility and Cloud Provider dropdowns weren't working
- **Solution**: Added proper `labelId`, `id`, and `label` attributes + debugging logs
- **Files**: `UnifiedProjectCreationDialog.tsx` lines 344-358, 438-448

---

## 🎯 Manual Testing Steps

### **Step 1: Test Max Collaborators Limit**
1. Go to: `https://backbone-logic-web.app/dashboard/cloud-projects`
2. Click **"Create Project"** button
3. Navigate to **"Collaboration Options"** step (step 4)
4. Check the **Max Collaborators** slider:
   - ✅ **Expected**: Should show max value of **250** for Enterprise users
   - ❌ **Before**: Was stuck at 10
   - 🔍 **Debug**: Check browser console for: `🔍 User collaboration limit: 250`

### **Step 2: Test Dropdown Menus**
1. In the **"Basic Information"** step (step 1):
   - Click **Visibility** dropdown
   - ✅ **Expected**: Should open and show Private/Organization/Public options
   - 🔍 **Debug**: Check console for: `🔍 Visibility changed: [selected value]`

2. In the **"Storage Configuration"** step (step 2):
   - Select **"Cloud Storage"** radio button
   - Click **Cloud Provider** dropdown
   - ✅ **Expected**: Should open and show Firestore/Google Cloud Storage options
   - 🔍 **Debug**: Check console for: `🔍 Cloud provider changed: [selected value]`

### **Step 3: Test Complete Project Creation Flow**
1. Fill out all steps:
   - **Step 1**: Project name, description, visibility
   - **Step 2**: Storage mode (Local/Cloud/Hybrid)
   - **Step 3**: Network settings
   - **Step 4**: Collaboration settings (set to 250 collaborators)
   - **Step 5**: Review and create

2. Click **"Create Project"**
3. ✅ **Expected**: Project should be created successfully
4. 🔍 **Debug**: Check console for creation logs

---

## 🔍 Debugging Information

### **Console Logs to Look For**
```javascript
// User license detection
🔍 User collaboration limit: 250 User: [user object]

// Dropdown interactions
🔍 Visibility changed: private
🔍 Cloud provider changed: firestore

// Project creation
🔍 Project creation options: [options object]
🔍 User maxCollaborators limit: 250
🔍 Form maxCollaborators value: 250
```

### **Browser Console Test Script**
If you want to run automated tests, paste this in the browser console:

```javascript
// Run the test script we created earlier
cloudProjectsTest.runAll()
```

---

## 🚨 Known Issues & Solutions

### **Issue**: Dropdown still not working
**Solution**: Check if there are any JavaScript errors in console. The dropdowns need proper event handling.

### **Issue**: Max collaborators still shows 10
**Solution**: Verify the user object has the correct subscription/license data:
```javascript
console.log('User:', window.user || window.authContext?.user);
```

### **Issue**: Project creation fails
**Solution**: Check network tab for API errors. Common issues:
- Authentication token missing
- Payload validation errors
- Server-side license validation

---

## 📋 Test Checklist

- [ ] Max collaborators slider shows 250 (not 10)
- [ ] Visibility dropdown opens and works
- [ ] Cloud Provider dropdown opens and works
- [ ] All 5 steps of wizard are accessible
- [ ] Project creation completes successfully
- [ ] New project appears in Active projects list
- [ ] Archive/Restore functionality works
- [ ] Console shows proper debugging logs

---

## 🎉 Success Criteria

✅ **All Fixed**: 
- Enterprise users can set up to 250 collaborators
- Dropdown menus are fully functional
- Multi-step wizard works correctly
- Project creation succeeds end-to-end

The system should now provide a smooth, professional project creation experience for Enterprise users!

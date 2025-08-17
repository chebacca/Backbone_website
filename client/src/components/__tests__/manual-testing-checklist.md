# Dataset Creation Wizard - Manual Testing Checklist

This checklist ensures all buttons, dropdowns, onClick handlers, and functionality work correctly in the Dataset Creation Wizard and integrated components.

## 🧪 Test Environment Setup

### Prerequisites
- [ ] Application is running locally
- [ ] User is authenticated with appropriate license (PRO/ENTERPRISE for testing collaboration limits)
- [ ] Cloud Projects page is accessible
- [ ] Browser developer tools are open for debugging

### Test Data Preparation
- [ ] Have valid Google Cloud service account JSON ready
- [ ] Have valid AWS access keys ready
- [ ] Have valid Azure storage account credentials ready
- [ ] Have test project names and descriptions ready

---

## 📋 Main Cloud Projects Page Tests

### Initial Page Load
- [ ] **Page renders correctly** with "Cloud Projects" header
- [ ] **Create Project button** is visible and clickable
- [ ] **Create Dataset button** is visible and clickable
- [ ] **Project list loads** (or shows empty state if no projects)
- [ ] **Tabs show correct counts** (Active Projects, Archived)

### Create Dataset Button
- [ ] **Click Create Dataset button** opens the Dataset Creation Wizard
- [ ] **Wizard opens with correct title** "Create Dataset"
- [ ] **Step 1 (Basic Information)** is active by default
- [ ] **Stepper shows all 7 steps** correctly

---

## 🧙‍♂️ Dataset Creation Wizard Tests

### Step 1: Basic Information
#### Form Fields
- [ ] **Dataset Name field** accepts text input
- [ ] **Description field** accepts multiline text
- [ ] **Visibility dropdown** opens and shows options:
  - [ ] Private (with icon and description)
  - [ ] Organization (with icon and description)  
  - [ ] Public (with icon and description)
- [ ] **Tags field** accepts comma-separated values

#### Validation
- [ ] **Next button disabled** when name is empty
- [ ] **Error message shows** "Dataset name is required" when clicking Next without name
- [ ] **Character limit validation** works (100 characters max)
- [ ] **Can proceed to Step 2** when name is filled

#### Navigation
- [ ] **Back button is disabled** on first step
- [ ] **Cancel button closes** the wizard
- [ ] **Close (X) button closes** the wizard

### Step 2: Cloud Provider Selection
#### Provider Cards
- [ ] **All 5 provider cards render**:
  - [ ] Google Firestore (with Real-time, Serverless chips)
  - [ ] Google Cloud Storage (with Object Storage, Global CDN chips)
  - [ ] Amazon S3 (with Enterprise, 99.999999999% chips)
  - [ ] AWS Services (with Full AWS, Scalable chips)
  - [ ] Microsoft Azure Blob Storage (with Enterprise, AD Integration, Global chips)

#### Selection Interaction
- [ ] **Firestore is selected by default**
- [ ] **Clicking card selects provider** (radio button updates)
- [ ] **Card border changes** when selected (primary color)
- [ ] **Only one provider can be selected** at a time

#### Navigation
- [ ] **Back button returns to Step 1**
- [ ] **Next button proceeds to Step 3**
- [ ] **Selected provider persists** when navigating back/forward

### Step 3: Authentication Setup
#### Google Cloud (Firestore/GCS)
- [ ] **Google Cloud Authentication section** appears
- [ ] **Project ID field** accepts text input
- [ ] **Service Account Key field** accepts JSON input
- [ ] **Visibility toggle button** works for Service Account Key
- [ ] **Help text and links** are displayed correctly

#### AWS (S3/Services)  
- [ ] **AWS Authentication section** appears
- [ ] **Access Key ID field** accepts text input
- [ ] **Secret Access Key field** accepts text input (password type)
- [ ] **Region field** accepts text input
- [ ] **Visibility toggle button** works for Secret Access Key
- [ ] **Help text and links** are displayed correctly

#### Azure
- [ ] **Azure Authentication section** appears
- [ ] **Storage Account Name field** accepts text input
- [ ] **Storage Account Key field** accepts text input (password type)
- [ ] **Connection String field** accepts text input (password type)
- [ ] **Visibility toggle buttons** work for sensitive fields
- [ ] **Help text and links** are displayed correctly

#### Connection Testing
- [ ] **Test Connection button** is present
- [ ] **Button is disabled** when required fields are empty
- [ ] **Button shows loading state** when clicked
- [ ] **Success/error message appears** after test completes
- [ ] **Test works for each provider type**

#### Validation
- [ ] **Required field validation** works for each provider
- [ ] **Error messages are provider-specific**
- [ ] **Cannot proceed without required fields**

### Step 4: Storage Configuration
#### Google Cloud Storage
- [ ] **GCS Bucket Name field** accepts text input
- [ ] **Prefix field** accepts text input (optional)
- [ ] **Validation requires bucket name**
- [ ] **Helper text explains bucket requirements**

#### Amazon S3
- [ ] **S3 Bucket Name field** accepts text input
- [ ] **Region field** accepts text input
- [ ] **Prefix field** accepts text input (optional)
- [ ] **Validation requires bucket and region**

#### AWS Services
- [ ] **AWS Bucket Name field** accepts text input
- [ ] **Region field** accepts text input
- [ ] **Prefix field** accepts text input (optional)
- [ ] **Validation requires bucket and region**

#### Azure Blob Storage
- [ ] **Container Name field** accepts text input
- [ ] **Prefix field** accepts text input (optional)
- [ ] **Validation requires container name**

#### Firestore
- [ ] **Info message displays** explaining no additional config needed
- [ ] **Can proceed immediately** without additional fields

### Step 5: Schema Template Selection
#### Template Cards
- [ ] **All 6 template cards render**:
  - [ ] Custom Schema (with Settings icon)
  - [ ] Inventory Management (with Storage icon)
  - [ ] Session Management (with Dataset icon)
  - [ ] Media Files (with Cloud icon)
  - [ ] User Management (with Security icon)
  - [ ] Analytics & Metrics (with Info icon)

#### Template Selection
- [ ] **Custom is selected by default**
- [ ] **Clicking card selects template** (radio button updates)
- [ ] **Card descriptions are helpful**
- [ ] **Field previews show** for pre-built templates

#### Custom Schema Editor
- [ ] **Custom Fields section appears** when Custom is selected
- [ ] **Add Field button** creates new field row
- [ ] **Field Name input** accepts text
- [ ] **Type dropdown** shows all options (String, Number, Boolean, Date, Object, Array)
- [ ] **Description input** accepts text
- [ ] **Required toggle** works
- [ ] **Delete button** removes field row
- [ ] **Empty state message** shows when no fields

### Step 6: Advanced Options
#### Security & Compliance
- [ ] **Enable Encryption toggle** works
- [ ] **Access Logging toggle** works
- [ ] **Helper text explains** each option

#### Performance & Storage
- [ ] **Enable Compression toggle** works
- [ ] **Version Control toggle** works
- [ ] **Helper text explains** each option

#### Backup & Recovery
- [ ] **Automatic Backups toggle** works (enabled by default)
- [ ] **Helper text explains** backup functionality

### Step 7: Review & Create
#### Review Information
- [ ] **Dataset name displays** correctly
- [ ] **Description displays** (if provided)
- [ ] **Chips show**:
  - [ ] Cloud provider (with correct color)
  - [ ] Visibility setting
  - [ ] Schema template type
  - [ ] Tag count (if any)

#### Configuration Summary
- [ ] **Cloud Provider** displays correctly
- [ ] **Storage details** show provider-specific info
- [ ] **Schema information** displays template or custom field count
- [ ] **Advanced Features** list enabled options
- [ ] **Auto-assign info** shows if assignToProject prop is set

#### Final Actions
- [ ] **Create Dataset button** is enabled with valid data
- [ ] **Button shows loading state** during creation
- [ ] **Success callback fires** on successful creation
- [ ] **Error message displays** on creation failure
- [ ] **Wizard closes** after successful creation

---

## 🔗 Integration Tests

### Main Page Integration
- [ ] **Create Dataset button** opens wizard correctly
- [ ] **Wizard closes** return to main page
- [ ] **Project list refreshes** after dataset creation
- [ ] **Dataset counts update** in project cards

### Project Details Integration
- [ ] **Settings button** opens project details dialog
- [ ] **Assigned Datasets section** displays
- [ ] **Dataset selection dropdown** populates with available datasets
- [ ] **Backend filter dropdown** works correctly
- [ ] **Search field** filters datasets
- [ ] **Assign button** works when dataset is selected
- [ ] **Remove button** works for assigned datasets
- [ ] **Apply Filters button** refreshes dataset list

### Project Creation Integration
- [ ] **UnifiedProjectCreationDialog** shows dataset selection only
- [ ] **No dataset creation** in project creation flow
- [ ] **Help text directs** to main page for dataset creation
- [ ] **Selected datasets** are assigned to new project

---

## 🎯 Cloud Provider Specific Tests

### Google Cloud (Firestore/GCS)
- [ ] **Service account JSON validation** works
- [ ] **Project ID validation** works
- [ ] **GCS bucket name validation** works
- [ ] **Connection test** attempts authentication
- [ ] **Error messages** are Google Cloud specific

### AWS (S3/Services)
- [ ] **Access key validation** works
- [ ] **Secret key validation** works
- [ ] **Region validation** works
- [ ] **S3 bucket name validation** works
- [ ] **Connection test** attempts AWS authentication
- [ ] **Error messages** are AWS specific

### Azure Blob Storage
- [ ] **Storage account name validation** works
- [ ] **Storage account key validation** works
- [ ] **Connection string validation** works (alternative)
- [ ] **Container name validation** works
- [ ] **Connection test** attempts Azure authentication
- [ ] **Error messages** are Azure specific

---

## 📱 Responsive Design Tests

### Mobile (375px width)
- [ ] **Wizard dialog** fits mobile screen
- [ ] **Form fields** are properly sized
- [ ] **Buttons** are touch-friendly
- [ ] **Cards** stack vertically
- [ ] **Text remains readable**

### Tablet (768px width)
- [ ] **Layout adapts** to tablet size
- [ ] **Cards** arrange appropriately
- [ ] **Form fields** use available space

### Desktop (1200px+ width)
- [ ] **Full layout** displays correctly
- [ ] **Cards** arrange in grid
- [ ] **Optimal spacing** is maintained

---

## 🚨 Error Handling Tests

### Network Errors
- [ ] **API failures** show appropriate error messages
- [ ] **Connection timeouts** are handled gracefully
- [ ] **Invalid responses** don't crash the application

### Validation Errors
- [ ] **Required field errors** are clear and helpful
- [ ] **Format validation errors** guide user correction
- [ ] **Server validation errors** are displayed properly

### Edge Cases
- [ ] **Very long dataset names** are handled
- [ ] **Special characters** in fields work correctly
- [ ] **Empty responses** don't break the UI
- [ ] **Concurrent operations** don't cause conflicts

---

## ✅ Performance Tests

### Loading Performance
- [ ] **Wizard opens quickly** (< 500ms)
- [ ] **Step transitions** are smooth
- [ ] **Form interactions** are responsive
- [ ] **No memory leaks** during extended use

### Data Handling
- [ ] **Large JSON inputs** are handled efficiently
- [ ] **Many custom fields** don't slow the UI
- [ ] **Dataset lists** load quickly

---

## 🔒 Security Tests

### Credential Handling
- [ ] **Passwords are masked** by default
- [ ] **Sensitive data** doesn't appear in browser dev tools
- [ ] **Form data** is cleared on wizard close
- [ ] **No credentials** logged to console

### Input Sanitization
- [ ] **XSS attempts** are prevented
- [ ] **SQL injection attempts** are blocked
- [ ] **File upload restrictions** work correctly

---

## 📊 Test Results

### Test Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___

### Critical Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Minor Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Recommendations
1. ________________________________
2. ________________________________
3. ________________________________

---

## 🎉 Sign-off

**Tester**: ________________  
**Date**: ________________  
**Environment**: ________________  
**Browser**: ________________  
**Status**: ✅ PASS / ❌ FAIL  

**Notes**: 
_________________________________
_________________________________
_________________________________

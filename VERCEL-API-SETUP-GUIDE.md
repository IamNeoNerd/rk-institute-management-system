# 🔧 Vercel API Token Setup Guide
## MCP Autonomous Deployment Environment Configuration

**Objective**: Obtain Vercel API token to programmatically add missing environment variables

---

## 🎯 **QUICK SETUP (2 minutes)**

### **Step 1: Get Vercel API Token**

1. **Go to Vercel Dashboard**: https://vercel.com/account/tokens
2. **Click "Create Token"**
3. **Token Name**: `MCP-Autonomous-Deployment`
4. **Scope**: Select your account/team
5. **Expiration**: 30 days (or as needed)
6. **Click "Create"**
7. **Copy the token** (starts with `vercel_`)

### **Step 2: Configure Token**

**Option A: Environment Variable (Recommended)**
```bash
# Add to your environment
export VERCEL_TOKEN="vercel_your_token_here"
```

**Option B: Direct Script Execution**
```bash
# Run with token as parameter
VERCEL_TOKEN="vercel_your_token_here" node scripts/vercel-env-manager.js
```

**Option C: Manual Token Input**
```bash
# Edit the script file and replace the token
# Line: this.apiToken = apiToken || process.env.VERCEL_TOKEN || 'your_vercel_token_here';
# Replace 'your_vercel_token_here' with your actual token
```

---

## 🚀 **AUTOMATED EXECUTION**

Once you have the token, run:

```bash
# Method 1: With environment variable
export VERCEL_TOKEN="your_token_here"
node scripts/vercel-env-manager.js

# Method 2: Inline
VERCEL_TOKEN="your_token_here" node scripts/vercel-env-manager.js
```

---

## 📊 **EXPECTED RESULTS**

The script will:

1. **✅ List existing environment variables** (5 current variables)
2. **➕ Add JWT_SECRET** to Preview/Development/Production environments
3. **➕ Add JWT_EXPIRY** to Preview/Development/Production environments  
4. **🔍 Verify configuration** (should show 7 total variables)
5. **🚀 Trigger automatic deployment** (Vercel auto-deploys on env changes)

---

## 🎯 **SUCCESS INDICATORS**

### **Environment Variables Added:**
```bash
✅ JWT_SECRET=mcp_autonomous_deployment_jwt_secret_key_2025
✅ JWT_EXPIRY=4h
```

### **Deployment Triggered:**
- New deployment should appear in GitHub API within 1-2 minutes
- Our monitoring system will detect it automatically
- Deployment should succeed this time

---

## 🔧 **TROUBLESHOOTING**

### **"Not authorized" Error:**
- ✅ Verify token is correct and starts with `vercel_`
- ✅ Check token has not expired
- ✅ Ensure token has project access permissions

### **"Project not found" Error:**
- ✅ Verify project ID: `prj_SSG5WpGBBO3tRfyA0GKAtDhymr24`
- ✅ Check token has access to the project

### **"Environment variable exists" Error:**
- ✅ Script will update existing variables automatically
- ✅ No manual intervention needed

---

## 🎉 **NEXT STEPS AFTER SUCCESS**

1. **🔍 Monitor deployment** via our GitHub API monitoring
2. **⏱️  Wait 2-3 minutes** for Vercel build completion
3. **🧪 Test MCP endpoints** on preview URL
4. **📱 Validate mobile optimization** performance
5. **🚀 Create Pull Request** for autonomous deployment activation

---

## 📋 **MANUAL FALLBACK (If API Fails)**

If the API approach doesn't work, try these manual methods:

### **Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add environment variables
vercel env add JWT_SECRET
# Enter value: mcp_autonomous_deployment_jwt_secret_key_2025
# Select environments: Preview, Development, Production

vercel env add JWT_EXPIRY  
# Enter value: 4h
# Select environments: Preview, Development, Production
```

### **Method 2: Different Browser/Incognito**
- Try adding variables in incognito/private browsing mode
- Clear browser cache and cookies for vercel.com
- Try different browser (Chrome, Firefox, Edge)

### **Method 3: Team Member Access**
- Ask team member with admin access to add variables
- Share the exact variable names and values needed

---

## ✅ **READY FOR EXECUTION**

**🎯 Current Status**: Waiting for Vercel API token to complete automated environment variable configuration

**🚀 Next Action**: Get Vercel API token and run the automated script to resolve deployment failures

**⏱️  Estimated Time**: 2 minutes to get token + 1 minute to run script + 3 minutes for deployment = **6 minutes total**

# 🔐 Create User Accounts

Your app needs two user accounts to work. Follow these steps:

## Step 1: Go to Supabase Auth Dashboard

Open: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/auth/users

## Step 2: Create Creator Account (Mauro)

1. Click **"Add User"** button (top right)
2. Select **"Create new user"**
3. Fill in:
   - **Email**: `creator@dutch.app`
   - **Password**: `creator-secure-2024-dutch`
   - ✅ **Check "Auto Confirm User"** (IMPORTANT!)
4. Click **"Create User"**
5. After user is created, click on the user in the list
6. Go to **"User Metadata"** section
7. Click **"Edit"** and add:
   ```json
   {
     "name": "Mauro",
     "role": "teacher"
   }
   ```
8. Click **"Save"**

## Step 3: Create Learner Account (Xindy)

1. Click **"Add User"** button again
2. Select **"Create new user"**
3. Fill in:
   - **Email**: `learner@dutch.app`
   - **Password**: `learner-secure-2024-dutch`
   - ✅ **Check "Auto Confirm User"** (IMPORTANT!)
4. Click **"Create User"**
5. After user is created, click on the user in the list
6. Go to **"User Metadata"** section
7. Click **"Edit"** and add:
   ```json
   {
     "name": "Xindy",
     "role": "student"
   }
   ```
8. Click **"Save"**

## Step 4: Test Login

1. Go back to your app
2. Refresh the page
3. Click on either "Mauro" (Creator) or "Xindy" (Learner)
4. You should now be logged in! ✅

## Troubleshooting

### "Email not confirmed" error
- Make sure you checked **"Auto Confirm User"** when creating the account
- Or go to the user → Click "Send confirmation email"

### "Invalid login credentials" error
- Double-check the email and password match exactly
- Make sure both users are created

### Still getting 401 errors
- Make sure the user metadata includes `name` and `role`
- Try logging out and logging in again

---

## Quick Reference

**Creator (Mauro)**:
- Email: `creator@dutch.app`
- Password: `creator-secure-2024-dutch`
- Metadata: `{"name": "Mauro", "role": "teacher"}`

**Learner (Xindy)**:
- Email: `learner@dutch.app`
- Password: `learner-secure-2024-dutch`
- Metadata: `{"name": "Xindy", "role": "student"}`

---

Once both accounts are created, your app will be fully functional! 🚀

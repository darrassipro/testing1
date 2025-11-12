# 🚀 Quick Start - IA Translation Setup

## Step 1: Initialize Database

Run the initialization script to create IA model entries:

```bash
cd server-go-fez
node scripts/initializeIAModels.js
```

✅ This creates 3 models: Gemini (default), Grok, and OpenAI

## Step 2: Get API Keys

Choose one or more providers:

### Option A: Gemini (Recommended - Free tier available)
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create a new project or use existing
4. Copy your API key

### Option B: Grok
1. Go to https://x.ai/api
2. Sign up / Log in
3. Generate API key
4. Copy your API key

### Option C: OpenAI
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Create new secret key
4. Copy your API key (you won't see it again!)

## Step 3: Configure in Admin Panel

1. Start your server:
   ```bash
   cd server-go-fez
   npm start
   ```

2. Start your client:
   ```bash
   cd client
   npm run dev
   ```

3. Go to: `http://localhost:3000/admin`

4. Navigate to "IA Models Management"

5. Click "Edit" on your chosen provider

6. Fill in:
   - ✅ **API Key**: Paste your API key
   - ✅ **Model**: Select from dropdown (keep default for best performance)
   - ✅ **Prompt**: Keep the default (already optimized!)
   - ✅ **Active**: Check this box
   - ✅ **Default**: Check this box

7. Click "Save"

## Step 4: Test Translation

1. Go to any admin form (POI, Circuit, Theme, etc.)

2. Fill in ONE language field (name, description, or address)

3. Click the **"✨ 🌐 Traduire"** button

4. Wait 1-2 seconds ⚡

5. Click "Apply all translations" or individual language buttons

6. Done! All 3 languages translated in one go! 🎉

## 🎯 Recommended Setup

**For Best Performance & Cost:**
- **Provider**: Gemini
- **Model**: `gemini-2.0-flash-exp`
- **Why**: Fastest, cheapest, excellent quality

**For Highest Quality:**
- **Provider**: OpenAI
- **Model**: `gpt-4o-mini`
- **Why**: Best accuracy, good speed, reasonable cost

**For Balance:**
- **Provider**: Grok
- **Model**: `grok-beta`
- **Why**: Great balance of speed and quality

## 🔍 Verify Setup

Check the IA Models table shows:
- ✅ Green "Actif" badge
- ✅ Blue "API OK" badge
- ⭐ "Par défaut" badge (on one model)

If you see:
- ❌ Red "Inactif" - Check the "Active" checkbox
- ⚠️ "Pas d'API" - Add your API key

## 💡 Pro Tips

1. **Multiple Providers**: You can configure all 3 providers and switch between them
2. **Fallback**: If one fails, edit and switch to another provider
3. **Cost Control**: Gemini has generous free tier, perfect for testing
4. **Custom Prompts**: Advanced users can modify prompts for specific needs

## 🐛 Common Issues

**"No AI provider found"**
- Solution: Make sure at least one model is marked as "Default" and "Active"

**"API error"**
- Solution: Verify your API key is correct and has credits/quota

**"Slow translation"**
- Solution: Switch to Gemini with `gemini-2.0-flash-exp` model

**"JSON parse error"**
- Solution: Keep the default prompts - they're optimized for JSON output

## 📊 What You Get

### Before (Sequential Translation)
- Call 1: Translate to French → Wait 1-2s
- Call 2: Translate to Arabic → Wait 1-2s  
- Call 3: Translate to English → Wait 1-2s
- **Total**: 3-6 seconds, 3 API calls

### After (Batch Translation) ✨
- Call 1: Translate to FR + AR + EN → Wait 1-2s
- **Total**: 1-2 seconds, 1 API call
- **Result**: 66% faster, 66% cheaper! 🚀

## 🎉 You're Ready!

Now you have:
- ✅ Fast batch translations
- ✅ Multi-language support (FR, AR, EN)
- ✅ Beautiful UI with suggestions
- ✅ One-click apply
- ✅ Cost-effective solution

Happy translating! 🌍✨

---

**Need Help?** Check `IA_MODELS_GUIDE.md` for detailed documentation.

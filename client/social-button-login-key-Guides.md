````markdown
# Guide: How to Get Social Login Keys (Google & Facebook)

This guide explains how to get the necessary API keys and secrets for your `client/.env.local` file to enable social logins with NextAuth.

---

## 1. NextAuth Secret (`NEXTAUTH_SECRET`)

This is a random security key used to encrypt user sessions. You must generate this yourself.

1.  Open your terminal (Command Prompt, PowerShell, or Git Bash).
2.  Run the following command:
    ```bash
    openssl rand -base64 32
    ```
3.  Copy the long, random string it produces (e.g., `aBcDeFgH1iJkLmNoP...`) and paste it into your `client/.env.local` file.

**`.env.local` entry:**
```ini
NEXTAUTH_SECRET=paste_your_generated_key_here
````

-----

## 2\. Google Keys (`GOOGLE_...`)

You need to create a project in the Google Cloud Console.

1.  **Go to:** [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create Project:** Click the project dropdown (top left) \> **"New Project"**. Name it "Go Fez" (or your app name) and create it.
3.  **Configure Consent Screen:**
      * In the sidebar, go to **"APIs & Services"** \> **"OAuth consent screen"**.
      * Choose **"External"** and click Create.
      * Fill in the required fields: App Name ("Go Fez"), User Support Email, and Developer Contact Email.
      * Save and Continue through the "Scopes" and "Test Users" sections.
4.  **Get Credentials:**
      * Go to **"Credentials"** (left sidebar).
      * Click **"+ CREATE CREDENTIALS"** \> **"OAuth client ID"**.
      * **Application type:** Select **"Web application"**.
      * **Name:** "Next.js Client" (or any name).
      * **Authorized JavaScript origins:** Add `http://localhost:3000`
      * **Authorized redirect URIs:** Add `http://localhost:3000/api/auth/callback/google`
      * Click **Create**.
5.  **Copy Keys:**
      * A popup will appear showing your keys.
      * Copy **"Your Client ID"** -\> `GOOGLE_CLIENT_ID`.
      * Copy **"Your Client Secret"** -\> `GOOGLE_CLIENT_SECRET`.

**`.env.local` entries:**

```ini
# Google Keys
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

-----

## 3\. Facebook (Meta) Keys (`FACEBOOK_...`)

You need to create an App on the Meta for Developers platform.

1.  **Go to:** [Meta for Developers](https://developers.facebook.com/) and log in.
2.  **Create App:**
      * Click **"My Apps"** \> **"Create App"**.
      * Select **"Consumer"** (or "Authenticate and request data from users") and click Next.
      * Enter an "App Display Name" (e.g., "Go Fez Login") and create the app.
3.  **Get Keys:**
      * On your new app's sidebar, go to **App Settings** \> **Basic**.
      * **App ID**: Copy this value -\> `FACEBOOK_CLIENT_ID`.
      * **App Secret**: Click "Show", enter your password, and copy the value -\> `FACEBOOK_CLIENT_SECRET`.
4.  **Configure Redirect URI:**
      * On the sidebar, find **"Add product"**. Add **"Facebook Login"** and click **"Set Up"**.
      * Choose **"Web"**.
      * For "Site URL", enter `http://localhost:3000` and Save.
      * On the sidebar, under **Facebook Login**, click **Settings**.
      * Find the field **"Valid OAuth Redirect URIs"** and enter:
        `http://localhost:3000/api/auth/callback/facebook`
      * Save Changes at the bottom of the page.

**`.env.local` entries:**

```ini
# Facebook Keys
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

-----

## 4\. Summary of Redirect URIs

If these URIs are wrong, or have a typo, the login will fail. They must be **exact**.

  * **Facebook:**
    ```
    http://localhost:3000/api/auth/callback/facebook
    ```
  * **Google:**
    ```
    http://localhost:3000/api/auth/callback/google
    ```

<!-- end list -->

```
```
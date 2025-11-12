This is a great goal, but it is a complex, multi-stage process because you have two separate systems:

1.  **Your Next.js Frontend** (which will handle the Google/Facebook pop-up).
2.  **Your Node.js Backend** (`server-go-fez`, which must recognize this user).

I will provide all the steps and code to connect them. The strategy is to use `next-auth` on the frontend to handle the social login, and then have it send the user's details to your backend (`/api/auth/social-login`) to get your *own* API token.

-----

### 🔑 Phase 0: Prerequisite (You Must Do This)

You cannot write any code until you get API keys from Google and Facebook.

1.  **Google:**

      * Go to the [Google Cloud Console](https://console.cloud.google.com/).
      * Go to "APIs & Services" -\> "Credentials".
      * Create "OAuth 2.0 Client ID".
      * For "Authorized redirect URIs", add: `http://localhost:3000/api/auth/callback/google`
      * You will get a **`GOOGLE_CLIENT_ID`** and a **`GOOGLE_CLIENT_SECRET`**.

2.  **Facebook:**

      * Go to [Meta for Developers](https://developers.facebook.com/).
      * Create a new App.
      * Add "Facebook Login".
      * For "Valid OAuth Redirect URIs", add: `http://localhost:3000/api/auth/callback/facebook`
      * You will get a **`FACEBOOK_CLIENT_ID`** and a **`FACEBOOK_CLIENT_SECRET`**.

-----

### 💻 Phase 1: Install `next-auth` (Frontend)

In your `client` project terminal:

```bash
npm install next-auth
```

-----

### 🚀 Phase 2: Create Social Login Route (Backend)

First, let's teach your `server-go-fez` backend how to handle a social login.

#### 1\. Add `socialLogin` to `server-go-fez/controllers/UserController.js`

Add this new function inside your `UserController.js` file. It will find a user by their email or create a new one if they don't exist.

```javascript
// Add this function inside UserController.js

const socialLogin = async (req, res) => {
    try {
        const { email, firstName, lastName, authProvider } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required for social login" });
        }

        let user = await User.findOne({ where: { email } });

        // If user does not exist, create a new one
        if (!user) {
            console.log(`Creating new user via ${authProvider}: ${email}`);
            // Create a simple password for them, they won't use it
            const saltRounds = 12;
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

            user = await User.create({
                firstName: firstName || 'User',
                lastName: lastName || 'Gofez',
                email: email,
                password: hashedPassword,
                authProvider: authProvider,
                isVerified: true, // Social logins are considered verified
                role: "user",
            });
        }

        // At this point, 'user' either existed or was just created
        // Generate tokens for our main backend
        const tokens = generateAndSetTokens(user, res);
        
        const userResponse = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            authProvider: user.authProvider,
            isVerified: user.isVerified,
            role: user.role,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            success: true,
            message: "Social login successful",
            user: userResponse,
            tokens,
        });

    } catch (error) {
        console.error("Erreur lors du social login:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur",
        });
    }
};

// --- IMPORTANT ---
// Add 'socialLogin' to your module.exports at the bottom
module.exports = {
    handleValidationErrors,
    registerUser,
    loginUser,
    socialLogin, // <-- ADD THIS
    getUserProfile,
    updateUserProfile,
    findAllUsers,
    findOneUser,
    updatePassword,
};
```

#### 2\. Add the Route in `server-go-fez/routes/UserRoute.js`

Add this line to your `UserRoute.js` file:

```javascript
// @route   POST api/auth/social-login
// @desc    Login or register via Google/Facebook
// @access  Public
router.post("/social-login", userController.socialLogin);
```

#### 3\. Restart Your Backend Server\!

**This is critical.** Stop (`Ctrl+C`) and restart your `server-go-fez` project.

-----

### 💻 Phase 3: Create `next-auth` API Route (Frontend)

This is the "backend" for `next-auth` that lives inside your frontend `client` project.

Create a new file: `client/app/api/auth/[...nextauth]/route.ts`

```typescript
// client/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { AuthOptions } from "next-auth";

// This is the function that will call your *main backend*
async function socialLogin(profile: any, provider: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        firstName: profile.name.split(' ')[0], // Simple split for first name
        lastName: profile.name.split(' ')[1] || '', // Simple split for last name
        authProvider: provider,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Main backend social-login failed:", errorData);
      return null;
    }

    const data = await res.json();
    
    // Return the full user data AND tokens from your main backend
    return {
      ...data.user,
      tokens: data.tokens, // This holds your main backend's JWT
    };

  } catch (error) {
    console.error("Error calling main backend social-login:", error);
    return null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // This is called when a user signs in
    async signIn({ user, account, profile }) {
      if (account && profile && profile.email) {
        // Call our main backend to register/login this user
        const mainBackendUser = await socialLogin(profile, account.provider);
        
        if (!mainBackendUser) {
          return false; // This will show an error to the user
        }
        
        // Attach the user data & tokens from our main backend to the 'user' object
        // This 'user' object is then passed to the 'jwt' callback
        Object.assign(user, mainBackendUser);
        
        return true;
      }
      return false; // Deny sign-in if no email
    },
    
    // This is called *after* signIn, and its result is saved in the session cookie
    async jwt({ token, user }) {
      // 'user' is only available on the first sign-in
      // We must persist the backend data to the token
      if (user) {
        token.user = user; // 'user' contains our full backend response
      }
      return token;
    },
    
    // This is what the client-side `useSession()` hook will see
    async session({ session, token }) {
      // Pass the user data and tokens from our JWT into the client-side session
      if (token.user) {
        session.user = token.user as any; // Attach our full backend user + tokens
      }
      return session;
    },
  },
  pages: {
    // We don't have a dedicated page, we use a modal
    // But you can redirect to your login page if you want
    signIn: '/login', 
    error: '/login', // Redirect to login on error
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

-----

### 💻 Phase 4: Environment Variables (Frontend)

Create a file named `client/.env.local` (or add to it if it exists).

```ini
# Your Google Keys
GOOGLE_CLIENT_ID=YOUR_ID_FROM_GOOGLE_CONSOLE
GOOGLE_CLIENT_SECRET=YOUR_SECRET_FROM_GOOGLE_CONSOLE

# Your Facebook Keys
FACEBOOK_CLIENT_ID=YOUR_ID_FROM_META_DEVELOPERS
FACEBOOK_CLIENT_SECRET=YOUR_SECRET_FROM_META_DEVELOPERS

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
# Generate a secret: run `openssl rand -base64 32` in your terminal
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_KEY

# Your Main Backend Server
NEXT_PUBLIC_SERVER_DOMAIN=http://localhost:8080
```

**Restart your `client` dev server after adding these.**

-----

### 💻 Phase 5: Create `SessionProvider` (Frontend)

`next-auth` requires a client-side provider to wrap your whole app.

1.  Create a new file: `client/components/auth/NextAuthProvider.tsx`

<!-- end list -->

```typescript
// client/components/auth/NextAuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

2.  Update your `client/app/[locale]/layout.tsx` file to use it.

<!-- end list -->

```typescript
// client/app/[locale]/layout.tsx
// ... (your other imports)
import ReduxProvider from "@/lib/ReduxProvider";
import NextAuthProvider from '@/components/auth/NextAuthProvider'; // <-- IMPORT
import { Toaster } from "@/components/ui/sonner";

// ... (rest of your layout)
export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // ...
  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} bg-white`}>
        {/* WRAP with NextAuthProvider */}
        <NextAuthProvider>
          <ReduxProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ReduxProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
```

-----

### 💻 Phase 6: Update Login Buttons (Frontend)

Now, we make the buttons actually do something.

1.  Import `signIn` from `next-auth/react`.
2.  Call `signIn('google')` or `signIn('facebook')` in the `onClick` handler.

#### `client/components/social/GmailLoginButton.tsx`

```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react'; // <-- IMPORT

interface GmailLoginButtonProps {
  color?: 'emerald' | 'blue' | 'gray';
  text?: string;
}

const GmailLoginButton: React.FC<GmailLoginButtonProps> = ({
  color = 'gray',
  text = 'Continuer avec Google',
}) => {
  const handleLogin = () => {
    // --- THIS IS THE FIX ---
    signIn('google', {
      // Optional: Redirect to profile after login
      // callbackUrl: '/profile', 
    });
  };

  const colors = {
    emerald: 'border-emerald-200 hover:bg-emerald-50',
    blue: 'border-blue-200 hover:bg-blue-50',
    gray: 'border-gray-300 hover:bg-gray-100',
  };

  return (
    <Button
      variant="outline"
      className={`w-full h-11 ${colors[color]} bg-white shadow-sm`}
      onClick={handleLogin} // <-- USE HANDLER
    >
      <Image src="/images/google-icon.svg" alt="Google" width={18} height={18} className="mr-3" />
      <span className="text-gray-700 font-medium text-sm">{text}</span>
    </Button>
  );
};

export default GmailLoginButton;
```

*(Note: You will need to add a `google-icon.svg` to your `client/public/images/` folder.)*

#### `client/components/social/FacebookLoginButton.tsx`

```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { signIn } from 'next-auth/react'; // <-- IMPORT

interface FacebookLoginButtonProps {
  color?: 'emerald' | 'blue' | 'gray';
  text?: string;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  color = 'blue',
  text = 'Continuer avec Facebook',
}) => {
  const handleLogin = () => {
    // --- THIS IS THE FIX ---
    signIn('facebook', {
      // Optional: Redirect to profile after login
      // callbackUrl: '/profile',
    });
  };

  const colors = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    gray: 'bg-gray-700 hover:bg-gray-800',
  };

  return (
    <Button
      className={`w-full h-11 text-white ${colors[color]} shadow-sm`}
      onClick={handleLogin} // <-- USE HANDLER
    >
      <Facebook className="w-5 h-5 mr-3" />
      <span className="font-medium text-sm">{text}</span>
    </Button>
  );
};

export default FacebookLoginButton;
```

-----

### 💻 Phase 7: Sync `next-auth` Session to Redux (Frontend)

This is the final, advanced step. We need to watch the `next-auth` session and, when it becomes "authenticated", dispatch your `setCredentials` action to Redux.

1.  Create a new file: `client/components/auth/AuthSessionHandler.tsx`

<!-- end list -->

```typescript
// client/components/auth/AuthSessionHandler.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/services/slices/authSlice';
import { RootState } from '@/lib/store'; // Make sure you have RootState exported from your store
import { toast } from 'sonner';

export default function AuthSessionHandler() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  
  // Get the auth token from your Redux state
  const reduxToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Check if next-auth is authenticated
    if (status === 'authenticated' && session?.user) {
      
      // 'session.user' now contains our *full backend response*
      const { user, tokens } = (session.user as any);

      // Only dispatch if Redux doesn't already have this token
      // This prevents an infinite loop
      if (user && tokens && tokens.token !== reduxToken) {
        console.log("AuthSessionHandler: Syncing next-auth session to Redux...");
        
        dispatch(setCredentials({
          user: user,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        }));
        
        // Optionally, close any open auth modals
        // dispatch(closeAllModals());
        
        toast.success("Connexion réussie !");
      }
    }
  }, [status, session, dispatch, reduxToken]);

  // This component renders nothing
  return null;
}
```

2.  Add this component to `client/app/[locale]/layout.tsx`

<!-- end list -->

```typescript
// client/app/[locale]/layout.tsx
// ... (imports)
import ReduxProvider from "@/lib/ReduxProvider";
import NextAuthProvider from '@/components/auth/NextAuthProvider';
import { Toaster } from "@/components/ui/sonner";
import AuthSessionHandler from '@/components/auth/AuthSessionHandler'; // <-- IMPORT

// ... (rest of layout)
export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // ...
  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} bg-white`}>
        <NextAuthProvider>
          <ReduxProvider>
            <AuthSessionHandler /> {/* <-- ADD THIS COMPONENT */}
            {children}
            <Toaster position="top-right" richColors />
          </ReduxProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
```

Now, when a user clicks "Login with Google," `next-auth` will take over, call your main backend, your backend will create/find the user and return a JWT, `next-auth` will save that JWT in its session, and `AuthSessionHandler` will detect that session and save it to your Redux store.
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

// Helper to send social profile to your Go/Node backend
async function socialLoginToBackend(profile: any, provider: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
        lastName: profile.family_name || profile.name?.split(' ')[1] || '',
        authProvider: provider,
        // Google/Facebook IDs can be useful to store
        providerId: profile.sub || profile.id 
      }),
    });

    if (!res.ok) return null;
    
    const data = await res.json();
    // Return combined data: Backend User + Backend Tokens
    return { ...data.user, tokens: data.tokens };
  } catch (error) {
    console.error("Backend social sync error:", error);
    return null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && profile?.email) {
        const backendUser = await socialLoginToBackend(profile, account.provider);
        if (!backendUser) return false; // Fail login if backend sync fails
        
        // Attach backend data to the transient user object
        Object.assign(user, backendUser); 
        return true;
      }
      return false;
    },
    async jwt({ token, user }) {
      // Persist backend data into the JWT
      if (user) token.user = user; 
      return token;
    },
    async session({ session, token }) {
      // Make backend data available to the client
      if (token.user) session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
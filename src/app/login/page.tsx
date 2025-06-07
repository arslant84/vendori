
// src/app/login/page.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // For sign up
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
            setError('Display name is required for sign up.');
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast({ title: 'Account Created', description: 'Successfully signed up! Redirecting...' });
        router.push('/'); // Redirect to home or dashboard after sign up
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Login Successful', description: 'Redirecting...' });
        router.push('/'); // Redirect to home or dashboard after login
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please try again.');
      toast({ title: 'Authentication Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline font-black text-primary">
            {isSignUp ? 'Create an Account' : 'Welcome Back!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {isSignUp ? 'Fill in the details to join.' : 'Sign in to access your vendor insights.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  required={isSignUp}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-3 bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary">
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Button>
          <Link href="/" passHref>
             <Button variant="ghost" className="mt-2 text-muted-foreground">Back to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

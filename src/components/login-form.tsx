"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading, refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl && !callbackUrl.startsWith('/api')) {
        router.push(callbackUrl);
      } else {
        router.push(user.role === 'ADMIN' ? '/dashboard' : '/my-contract');
      }
    }
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const { data, error } = await res.json();

      if (!res.ok) {
        throw new Error(error || "Login failed");
      }

      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });

      // Refresh the auth context to get the latest user data
      await refreshAuth();

      // Get the callback URL if it exists
      const callbackUrl = searchParams.get('callbackUrl');

      // Navigate based on callback URL or user role
      if (callbackUrl && !callbackUrl.startsWith('/api')) {
        router.push(callbackUrl);
      } else {
        router.push(data.role === 'ADMIN' ? '/dashboard' : '/my-contract');
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Logo className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">ContractZenith</CardTitle>
        <CardDescription className="text-center">
          Sign in to manage your contracts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>
          Don't have an account?&nbsp;
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

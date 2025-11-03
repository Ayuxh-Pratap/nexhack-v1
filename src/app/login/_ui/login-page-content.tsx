"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { useAuth } from "@/hooks/use-auth";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/store/slices/auth/authThunks";
import type { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginPageContent() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<UserRole>("user");
    const [isSignUp, setIsSignUp] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/home");
        }
    }, [isAuthenticated, authLoading, router]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSignUp) {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
            }
        }

        setIsLoading(true);
        try {
            let result;
            if (isSignUp) {
                result = await dispatch(
                    signUpWithEmail({ email, password, name, role })
                ).unwrap();
                toast.success(`Welcome! Account created as ${role}.`);
            } else {
                result = await dispatch(
                    signInWithEmail({ email, password, role })
                ).unwrap();
                toast.success("Signed in successfully!");
            }
            
            // Wait a bit for Redux state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if authentication was successful
            if (result && result.user) {
                // Use window.location for reliable redirect
                window.location.href = "/home";
            } else {
                throw new Error("Authentication incomplete");
            }
        } catch (error: any) {
            console.error("Email auth error:", error);
            const errorMessage = error?.message || error?.data?.message || error || "Authentication failed";
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            const result = await dispatch(signInWithGoogle(role)).unwrap();
            
            // Wait a bit for Redux state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if authentication was successful
            if (result && result.user) {
                toast.success("Signed in with Google!");
                // Use window.location for reliable redirect
                window.location.href = "/home";
            } else {
                throw new Error("Authentication incomplete");
            }
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            const errorMessage = error?.message || error?.data?.message || error || "Google sign-in failed";
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Welcome to Velora</h1>
                    <p className="text-muted-foreground">
                        Your academic mentor and career counselor
                    </p>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={role === "user" ? "default" : "outline"}
                            onClick={() => setRole("user")}
                            disabled={isLoading}
                            className="w-full"
                        >
                            User
                        </Button>
                        <Button
                            type="button"
                            variant={role === "teacher" ? "default" : "outline"}
                            onClick={() => setRole("teacher")}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Teacher
                        </Button>
                    </div>
                </div>

                {/* Auth Tabs */}
                <Tabs value={isSignUp ? "signup" : "login"} onValueChange={(v) => setIsSignUp(v === "signup")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">Name</Label>
                                <Input
                                    id="signup-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm">Confirm Password</Label>
                                <Input
                                    id="signup-confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Sign In */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <FcGoogle className="h-4 w-4 mr-2" />
                    )}
                    {isSignUp ? "Sign up" : "Sign in"} with Google
                </Button>
            </div>
        </div>
    );
}


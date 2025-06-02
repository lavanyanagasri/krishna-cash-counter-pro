
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      // The useAuth hook will handle the redirect automatically when user state changes
    } catch (error) {
      // Error handling is done in the signIn function
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, add the user to localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      const existingUser = registeredUsers.find((user: any) => user.email === email);
      if (existingUser) {
        toast({
          title: "User Already Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Add new user
      registeredUsers.push({ email, password });
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      // Automatically sign in the user after signup
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      // Trigger storage event to update auth state
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Vaishnavi Jumbo Zerox! You are now signed in.",
      });

    } catch (error) {
      toast({
        title: "Sign Up Error",
        description: "An error occurred during sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Vaishnavi Jumbo Zerox
          </h1>
          <p className="text-lg text-blue-700">Powered by Sri Murali Krishna Computers</p>
          <p className="text-sm text-gray-600 mt-2">Cash Register System</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl text-center">
              {isSignUp ? "Create Account" : "Login"}
            </CardTitle>
            <CardDescription className="text-blue-100 text-center">
              {isSignUp ? "Sign up for a new account" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User {isSignUp ? "Sign Up" : "Login"}</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>
                </div>

                {!isSignUp && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    <p><strong>Note:</strong> User accounts can be created by signing up</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@vaishnavi.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In as Admin"}
                  </Button>
                </form>
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <p><strong>Admin Credentials:</strong></p>
                  <p>Email: admin@vaishnavi.com</p>
                  <p>Password: admin123</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

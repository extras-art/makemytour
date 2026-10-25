import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signup, login } from "../api";
import { setUser } from "@/store";
import { useDispatch } from "react-redux";
import { AlertCircle, Loader2 } from "lucide-react";

interface SignupDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "login" | "signup";
}

const SignupDialog = ({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultMode = "login",
}: SignupDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const [isSignup, setIsSignup] = useState(defaultMode === "signup");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/\d/.test(pass)) return "Password must contain at least one number.";
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      const passError = validatePassword(password);
      if (passError) {
        setError(passError);
        return;
      }

      setIsLoading(true);
      try {
        const data = await signup(
          firstName.trim(),
          lastName.trim(),
          email.trim(),
          phoneNumber.trim(),
          password
        );
        dispatch(setUser(data));
        setOpen(false);
        clearForm();
      } catch (err: any) {
        setError(err.message || "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const data = await login(email.trim(), password);
        dispatch(setUser(data));
        setOpen(false);
        clearForm();
      } catch (err: any) {
        setError(err.message || "Invalid email or password.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setError(null);
  };

  const switchMode = (signupMode: boolean) => {
    setIsSignup(signupMode);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          clearForm();
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isSignup ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {isSignup
              ? "Join MakeMyTour to book flights, hotels, and track trips."
              : "Enter your credentials to access your MakeMyTour account."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 py-2">
          {isSignup && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {isSignup && (
              <p className="text-xs text-gray-500">
                Minimum 8 characters, with uppercase, lowercase, and a number.
              </p>
            )}
          </div>

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isSignup ? "Creating Account..." : "Signing In..."}</span>
              </span>
            ) : isSignup ? (
              "Sign Up"
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 text-blue-600 font-semibold"
                onClick={() => switchMode(false)}
                type="button"
                disabled={isLoading}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                className="p-0 text-blue-600 font-semibold"
                onClick={() => switchMode(true)}
                type="button"
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;

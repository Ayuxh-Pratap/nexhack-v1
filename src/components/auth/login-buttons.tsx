"use client";
import { useAppDispatch } from "@/lib/store/hooks";
import { signInWithGoogle } from "@/store/slices/auth/authThunks";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";

interface LoginButtonsProps {
  role?: UserRole;
}

export const LoginButtons = ({ role = "student" }: LoginButtonsProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle(role)).unwrap();
      toast.success("Signed in with Google!");
      router.push("/home");
    } catch (error: any) {
      toast.error(error || "Google sign-in failed");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        className="w-full"
        onClick={handleGoogleSignIn}
        variant="outline"
      >
        <FcGoogle className="mr-2"/>
        Continue with Google
      </Button>
    </div>
  );
};
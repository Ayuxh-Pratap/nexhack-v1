"use client";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { signOut } from "@/store/slices/auth/authThunks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SignoutButton = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error || "Sign out failed");
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
    >
      Sign Out
    </Button>
  );
};
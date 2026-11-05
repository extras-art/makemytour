import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

export default function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: any) => state.user.user);
  const isAuthLoaded = useSelector((state: any) => state.user.isAuthLoaded);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoaded) return;
    const isAdmin =
      user && (user.role === "ROLE_ADMIN" || user.role === "ADMIN");
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded) return null;

  const isAdmin = user && (user.role === "ROLE_ADMIN" || user.role === "ADMIN");
  if (!isAdmin) return null;

  return <>{children}</>;
}


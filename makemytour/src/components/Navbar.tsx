import React from "react";
import SignupDialog from "./SignupDialog";
import { LogOut, Plane, ShieldCheck, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { clearUser } from "@/store";
import { logout as apiLogout } from "@/api";
import { useRouter } from "next/router";
import Link from "next/link";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignored
    }
    dispatch(clearUser());
    if (router.pathname.startsWith("/admin") || router.pathname.startsWith("/profile")) {
      router.push("/");
    }
  };

  const isAdmin = user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Plane className="w-8 h-8 text-red-600" />
          <span className="text-2xl font-black tracking-tight text-gray-900">
            MakeMy<span className="text-red-600">Tour</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50 flex items-center space-x-1"
                  onClick={() => router.push("/admin")}
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  <span>Admin Panel</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full border border-gray-200 p-0 hover:ring-2 hover:ring-red-500"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-red-600 text-white font-semibold">
                        {(user?.name || user?.firstName || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-gray-900">
                        {user?.name || user?.firstName || "User"}
                      </p>
                      <p className="text-xs leading-none text-gray-500 truncate">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] font-semibold bg-red-100 text-red-700 rounded w-fit">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile & Bookings</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4 text-red-600" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <SignupDialog
              trigger={
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
                >
                  Login / Sign Up
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import Link from "next/link";
import { ThemeToggle } from "./Themetoggle";
import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="border-b bg-background h-[10vh] flex items-center">
      <div className="container flex items-center justify-between px-4 md:px-6">
        {(await isAuthenticated()) ? (
          <Link href="/">
            <h1 className="font-bold text-2xl md:text-3xl">
              Fire<span className="text-primary">Pocket</span>
            </h1>
          </Link>
        ) : (
          <div className="flex items-center">
            <Link href="/">
              <h1 className="font-bold text-2xl md:text-3xl">
                Fire<span className="text-primary">Pocket</span>
              </h1>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-x-2 md:gap-x-5">
          {/* <ThemeToggle /> */}

          {(await isAuthenticated()) ? (
            <UserNav
              email={user?.email as string}
              image={user?.picture as string}
              name={user?.given_name as string}
            />
          ) : (
            <div className="flex items-center gap-x-2 md:gap-x-5">
              <LoginLink>
                <Button size="sm" className="px-2 md:px-4">Sign In</Button>
              </LoginLink>

              <RegisterLink>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="px-2 md:px-4"
                >
                  Sign Up
                </Button>
              </RegisterLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

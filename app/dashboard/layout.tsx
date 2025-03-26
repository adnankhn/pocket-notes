import { ReactNode } from "react";
import { DashboardNav } from "../components/DashboardNav";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "../lib/db";
import { stripe } from "../lib/stripe";
import { unstable_noStore as noStore } from "next/cache";

async function getData({
  email,
  id,
  firstName,
  lastName,
  profileImage,
}: {
  email: string;
  id: string;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | undefined | null;
}) {
  noStore();
  // Changed const to let to allow reassignment after creation
  let user = await prisma.user.findUnique({ 
    where: {
      id: id,
    },
    select: {
      id: true,
      stripeCustomerId: true,
      free_credits: true, // Select credits from User
      Subscription: {     // Select subscription status from User
        select: {
          status: true,
        },
      },
    },
  });

  if (!user && email && firstName && lastName) {
    // If user doesn't exist, create them (default credits are applied by Prisma)
    const name = `${firstName ?? ""} ${lastName ?? ""}`;
    await prisma.user.create({
      data: {
        id: id,
        email: email,
        name: name,
      },
      // Select the same fields after creation to ensure consistency
      select: {
        id: true,
        stripeCustomerId: true,
        free_credits: true,
        Subscription: {
          select: {
            status: true,
          },
        },
      },
    });
    // Assign the newly created user back to the 'user' variable
    // This ensures the rest of the function uses the created user data
    const createdUser = await prisma.user.findUnique({ where: { id: id }, select: { id: true, stripeCustomerId: true, free_credits: true, Subscription: { select: { status: true } } } });
    if (createdUser) user = createdUser; // Re-assign if creation was successful
  }

  // Ensure stripeCustomerId exists
  if (user && !user.stripeCustomerId) { // Check if user exists before accessing stripeCustomerId
    const customerData = await stripe.customers.create({ // Renamed variable
      email: email,
    });

    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        stripeCustomerId: customerData.id, // Use renamed variable
      },
    });
    // Optionally re-fetch user if stripeCustomerId is needed later, but it's returned now.
  }
  return user; // Return the user object
}


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser(); // Renamed to avoid conflict
  if (!kindeUser) {
    return redirect("/");
  }
  // Fetch user data including credits and subscription status
  const userData = await getData({ // Renamed variable and capture return value
    email: kindeUser.email as string,
    firstName: kindeUser.given_name as string,
    id: kindeUser.id as string,
    lastName: kindeUser.family_name as string,
    profileImage: kindeUser.picture,
  });

  // Removed the incorrect subscription query:
  // const sub = await prisma.subscription.findUnique({ ... });

  return (
    <div className="flex flex-col space-y-6 mt-10">
      <div className="container mx-auto px-4 sm:px-2 flex flex-1 gap-12 md:grid md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          {/* Pass credits and status with default values */}
          <DashboardNav 
            free_credits={userData?.free_credits ?? 0} 
            subscription_status={userData?.Subscription?.status ?? 'inactive'}
          />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

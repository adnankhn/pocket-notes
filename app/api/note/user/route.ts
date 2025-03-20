import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
var { Readability } = require("@mozilla/readability");
var { JSDOM } = require("jsdom");
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await request.json();
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Notes: {
        select: {
          title: true,
          id: true,
          // description: true,
          jsonData:true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },

      Subscription: {
        select: {
          status: true,
        },
      },
    },
  });


  return NextResponse.json({ data : data });
}
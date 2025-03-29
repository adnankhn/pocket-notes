import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
var { Readability } = require("@mozilla/readability");
var { JSDOM } = require("jsdom");
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { noteId } = await request.json();
  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });

  return new Response(null, { status: 200 });
}

export async function PATCH(request: Request) {
  // TODO: Add authentication/authorization check here if needed
  // const { getUser } = getKindeServerSession();
  // const user = await getUser();
  // if (!user) {
  //   return new NextResponse("Unauthorized", { status: 401 });
  // }

  const { noteId, is_published } = await request.json();

  if (!noteId || typeof is_published !== 'boolean') {
    return new NextResponse("Missing noteId or is_published flag", { status: 400 });
  }

  try {
    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
        // Optional: Add userId check to ensure user owns the note
        // userId: user.id,
      },
      data: {
        is_published: is_published,
      },
    });

    // Optional: Revalidate relevant paths if needed
    // revalidatePath(`/dashboard/new/${noteId}`);
    // revalidatePath('/community'); // If there's a community page

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Failed to update note:", error);
    // Handle potential errors, e.g., note not found
    return new NextResponse("Failed to update note", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { url, userId } = await request.json();

  // Fetch user credits and subscription status
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      free_credits: true,
      Subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const hasActiveSubscription = user.Subscription?.status === "active";
  const hasFreeCredits = user.free_credits > 0;

  // Check if user has credits or an active subscription
  if (!hasActiveSubscription && !hasFreeCredits) {
    return new NextResponse("Insufficient credits or inactive subscription", { status: 402 }); // Payment Required
  }

  // Decrement free credits if available
  if (hasFreeCredits) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        free_credits: {
          decrement: 1,
        },
      },
    });
  }
  // If no free credits but active subscription, proceed without decrementing

  async function fetchDataFromUrl(url: string) {
    const response = await fetch(`${url}`, {
      headers: {
        origin: process.env.PRODUCTION_SERVER_URL as string,
      },
    });
    const html = await response.text();
    const doc = new JSDOM(html, { url: url });

    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    let thumbnail = null;

    const contentDoc = new JSDOM(article.content).window.document;
    const leadImage = contentDoc.querySelector("img");
    if (leadImage) {
      thumbnail = leadImage.src;
    }

    const metaTags = doc.window.document.querySelectorAll(
      'meta[property="og:image"], meta[name="twitter:image"]'
    );
    if (metaTags.length > 0) {
      thumbnail = metaTags[0].getAttribute("content");
    }

    return {
      title: article.title,
      byline: article.byline,
      content: article.content,
      thumbnail: thumbnail,
    };
  }

  const jsonData = await fetchDataFromUrl(url);

  const newNote = await prisma.note.create({
    data: {
      userId: userId,
      title: jsonData.title,
      url: url,
      jsonData: jsonData,
    },
  });

  revalidatePath("/dasboard");

  return NextResponse.json({ jsonData: jsonData, noteId : newNote.id });
}

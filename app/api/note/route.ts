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

export async function POST(request: Request) {
  const { url, userId } = await request.json();

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

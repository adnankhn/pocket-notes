import { SubmitButton } from "@/app/components/Submitbuttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
// Removed client-side imports: useState, toast, Share2
// Removed Tabs imports as they are now in the client component

// Removed unused GoogleGenerativeAI imports
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// Removed ReactMarkdown and ExternalLink if not used elsewhere server-side
// import ReactMarkdown from 'react-markdown';
// import { ExternalLink } from "lucide-react";

// Removed SummaryComp import, now used in client component
import NoteDetailClient from "@/app/components/NoteDetailClient"; // Import the new client component
import { NoteData } from "@/app/lib/types"; // Import shared NoteData type

// Removed local NoteData definition


// Removed unused safetySettings constant
// const safetySettings = [ ... ];

// Removed unused generateArticleSummary function
// async function generateArticleSummary(data: NoteData): Promise<string> { ... }


async function getData({ userId, noteId }: { userId: string; noteId: string }): Promise<NoteData> { // Add return type
  // Removed noStore() to allow caching
  const data = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId: userId,
    },
    select: {
      title: true,
      description: true,
      id: true,
      jsonData: true,
      url: true,
      is_published: true,
      userId: true, // Select the note owner's ID
    },
  });

  return data;
}

// Removed unused cache maps
// const cachedSummaries = new Map<string, string>();
// const generationInProgress = new Map<string, Promise<string>>();


export default async function DynamicRoute({
  params,
}: {
  params: { id: string };
}) {
  // This is now a Server Component again
  // Fetch user and data on the server
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Handle case where user is not logged in
  if (!user || !user.id) {
     // Or redirect to login
     return <div>Please log in to view this note.</div>;
  }

  const data = await getData({ userId: user.id, noteId: params.id });

  // Removed unused generateAndCacheSummary function
  // async function generateAndCacheSummary(data: NoteData) { ... }

  // Removed unused postData function
  // async function postData(formData: FormData) { ... }

  // Render the client component, passing the fetched data and user IDs
  return (
    <NoteDetailClient
      initialData={data}
      noteUserId={data?.userId ?? null} // Pass note owner's ID
      currentUserId={user.id} // Pass current logged-in user's ID
    />
  );
}

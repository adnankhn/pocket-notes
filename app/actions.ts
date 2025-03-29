"use server";

import { revalidatePath } from "next/cache";
import prisma from "./lib/db"; // Import prisma client

const NOTES_PER_PAGE = 9; // Ensure this matches the client component

export async function loadMoreNotes({ skip, userId }: { skip: number; userId: string }) {
  "use server"; // Mark as a server action

  if (!userId) {
    // Handle case where userId might be missing, though unlikely if called from logged-in state
    return null; 
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
      },
      select: {
        title: true,
        id: true,
        jsonData: true, // Include jsonData as needed for thumbnails
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: NOTES_PER_PAGE,
    });
    return notes;
  } catch (error) {
    console.error("Error fetching more notes:", error);
    // Depending on requirements, you might want to throw the error
    // or return null/empty array to indicate failure
    return null; 
  }
}


// Keep the existing refreshDashboard function if still needed elsewhere
export async function saveSummary({ noteId, summary }: { noteId: string; summary: string }) {
  "use server";

  try {
    await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        summary: summary,
      },
    });
    revalidatePath(`/dashboard/new/${noteId}`); // Revalidate the note detail page
  } catch (error) {
    console.error("Error saving summary:", error);
    // Handle error appropriately (e.g., throw, return an error object)
  }
}

// Keep the existing refreshDashboard function if still needed elsewhere
export async function refreshDashboard() { // Added async keyword
    revalidatePath("/dashboard");
}

export async function loadCommunityNotes({ skip, take }: { skip: number; take: number }) {
  "use server";

  try {
    const notes = await prisma.note.findMany({
      where: {
        is_published: true, // Fetch only published notes
      },
      select: {
        title: true,
        id: true,
        jsonData: true, // For thumbnail
        createdAt: true,
        // Optionally select user info if needed (e.g., user name)
        // User: { select: { name: true } }
      },
      orderBy: {
        updatedAt: "desc", // Default sort by latest
      },
      skip: skip,
      take: take,
    });
    return notes;
  } catch (error) {
    console.error("Error fetching community notes:", error);
    return null; // Return null or empty array on error
  }
}

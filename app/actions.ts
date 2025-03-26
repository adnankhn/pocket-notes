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
export async function refreshDashboard() { // Added async keyword
    revalidatePath("/dashboard");
}

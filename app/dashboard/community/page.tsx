import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { loadCommunityNotes } from "@/app/actions"; // Import the new server action
import CommunityBody from "@/app/components/CommunityBody"; // Import the client component (to be created)
import { redirect } from "next/navigation";

const NOTES_PER_PAGE = 9; // Define batch size (should match client component and action)

// Define the type for a community note (can be shared)
export type CommunityNote = {
  title: string | null; // Allow null titles
  id: string;
  jsonData: any; // Keep flexible for now
  createdAt: Date;
  // Add User info if selected in the action
  // User?: { name: string | null };
};

async function getInitialCommunityNotes() {
  // Fetch the first batch of community notes
  const notes = await loadCommunityNotes({ skip: 0, take: NOTES_PER_PAGE });
  return notes;
}

export default async function CommunityPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Optional: Redirect if user is not logged in, or handle anonymously
  if (!user) {
    redirect("/api/auth/login"); // Or show a public version?
  }

  const initialNotes = await getInitialCommunityNotes();

  return (
    <CommunityBody
      initialNotes={initialNotes ?? []} // Pass initial notes, ensuring it's an array
      notesPerPage={NOTES_PER_PAGE}
    />
  );
}

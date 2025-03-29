// Define shared types for the application

// Type for data fetched for the note detail page
export type NoteData = {
  id: string;
  title: string | null;
  description: string | null; // This holds the AI summary
  jsonData: {
    title?: string | null;
    byline?: string | null;
    content?: string | null;
    thumbnail?: string | null; // Added thumbnail based on usage in DashboardBody
  } | null | any; // Using 'any' for flexibility, refine if possible
  url: string | null;
  is_published: boolean | null;
  userId: string | null; // ID of the user who owns the note
  // Removed 'summary' field as 'description' is used for AI summary
} | null; // Allow data itself to be null if not found

// Type for notes displayed in lists (Dashboard, Community)
export type NoteListItem = {
  id: string;
  title: string | null;
  jsonData: {
     thumbnail?: string | null;
  } | null | any; // Keep flexible for thumbnail
  createdAt: Date;
  // Add User info if needed for community page
  // User?: { name: string | null };
};

// Type specifically for community notes (inherits from NoteListItem)
export type CommunityNote = NoteListItem & {
   // Add any community-specific fields if needed later
};

// Type for initial data passed to DashboardBody
export type DashboardInitialData = {
  Notes: NoteListItem[]; // Use NoteListItem type
  free_credits: number;
  Subscription: {
    status: string;
  } | null;
} | null;

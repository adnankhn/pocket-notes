"use client";
import React, { useState, useEffect, FormEvent } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { File, Loader2 } from "lucide-react"; // Added Loader2
import { Card } from "@/components/ui/card";
import { TrashDelete } from "../components/Submitbuttons";
import { Input } from "@/components/ui/input";
import { loadMoreNotes } from "../actions"; // Import server action (will create later)
import { useInView } from "react-intersection-observer"; // Import hook

// Define the type for a single Note based on what's fetched
type Note = {
  title: string;
  id: string;
  jsonData: any; 
  createdAt: Date;
};

// Define the type for the initial data structure
type InitialData = {
  Notes: Note[];
  free_credits: number; 
  Subscription: {
    status: string;
  } | null;
} | null;

interface DashboardContentProps {
  initialData: InitialData; // Changed prop name
  userId: string; // Added userId prop
}

const NOTES_PER_PAGE = 12; // Same batch size as in page.tsx

export default function DashboardContent({ initialData, userId }: DashboardContentProps) {
  const [notes, setNotes] = useState<Note[]>(initialData?.Notes ?? []);
  const [skip, setSkip] = useState(NOTES_PER_PAGE); // Start skipping after the initial batch
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreNotes, setHasMoreNotes] = useState((initialData?.Notes?.length ?? 0) === NOTES_PER_PAGE); // Assume more if initial batch was full
  const { ref, inView } = useInView(); // Hook for intersection observer

  const [searchQuery, setSearchQuery] = useState<string>("");
  // Removed deletedNoteIds state as we filter directly now
  const [loadingDelete, setLoadingDelete] = useState<{
    [noteId: string]: boolean;
  }>({});

  // Extract user info from initialData for convenience
  const userInfo = {
    free_credits: initialData?.free_credits ?? 0, // Provide default value
    Subscription: initialData?.Subscription,
  };

  // Effect to load more notes when the sentinel element is in view
  useEffect(() => {
    if (inView && hasMoreNotes && !isLoading) {
      setIsLoading(true);
      loadMoreNotes({ skip, userId }) // Call server action (will create later)
        .then((newNotes: Note[] | null) => { // Added type for newNotes
          if (newNotes && newNotes.length > 0) {
            setNotes((prevNotes) => [...prevNotes, ...newNotes]);
            setSkip((prevSkip) => prevSkip + newNotes.length);
            setHasMoreNotes(newNotes.length === NOTES_PER_PAGE); // Check if the fetched batch was full
          } else {
            setHasMoreNotes(false); // No more notes to load
          }
        })
        .catch((error: any) => { // Added type for error
          console.error("Failed to load more notes:", error);
          // Optionally handle error state
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [inView, hasMoreNotes, isLoading, skip, userId]);


  if (!initialData) return null; // Keep initial check

  async function deleteNote(event: FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    setLoadingDelete((prevState) => ({ ...prevState, [noteId]: true }));

    try {
      // API to delete note - Consider using a server action here too for consistency
      // await fetch("https://firepocket.vercel.app/api/note"
      const response = await fetch("http://localhost:3000/api/note/", { // Use correct API endpoint if different
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: noteId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      // Instead of refreshDashboard(), update local state directly for better UX
      setNotes((prevNotes) => prevNotes.filter(note => note.id !== noteId)); 

    } catch (error) {
       console.error("Failed to delete note:", error);
       // Optionally show an error message to the user
    } finally {
       // Update loading state regardless of success/failure
       setLoadingDelete((prevState) => {
         const newState = { ...prevState };
         delete newState[noteId];
         return newState;
       });
    }
  }

  // Filter notes based on search query (using the 'notes' state)
  const filteredNotes = notes.filter((note) => {
    // Re-add jsonData search if needed, but it requires jsonData in the Note type
    const jsonDataValues = Object.values(note.jsonData || {}); 
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jsonDataValues.some(
        (value: any) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <div className="grid items-start gap-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="font-bold text-xl md:text-3xl lg:text-4xl">
            Your Collection
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            Here you can see your saved URLs
          </p>
        </div>

        {/* Use userInfo derived from initialData */}
        {userInfo.Subscription?.status === "active" ||
         userInfo.free_credits > 0 ? ( 
          <Button asChild>
            <Link href="/dashboard/new">Save new URL</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/billing">Create a new Note</Link>
          </Button>
        )}
      </div>

      {/* Search input */}
      <Input
        type="text"
        placeholder="Search bookmarks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="focus-visible:ring-transparent"
      />

      {/* Display initial notes or filtered notes */}
      {filteredNotes.length === 0 && !isLoading && !hasMoreNotes ? ( // Adjusted empty state condition
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            {searchQuery ? "No notes found matching your search." : "You don't have any notes yet."}
          </h2>
           <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
             {searchQuery ? "Try searching for something else." : "Create your first note to see it here."}
           </p>
           {/* Button logic remains the same */}
           {userInfo.Subscription?.status === "active" || userInfo.free_credits > 0 ? (
             <Button asChild>
               <Link href="/dashboard/new">Create a new Note</Link>
             </Button>
           ) : (
             <Button asChild>
               <Link href="/dashboard/billing">Create a new Note</Link>
             </Button>
           )}
        </div>
      ) : (
        // Notes Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
          {filteredNotes.map((item: Note) => ( // Added type for item
              <Card
                key={item.id}
                className="rounded-lg border bg-card text-card-foreground shadow-sm relative"
              >
                <div className="p-4">
                  <Link href={`/dashboard/new/${item.id}`}>
                    {item.jsonData && item.jsonData.thumbnail && (
                      <img
                        src={item.jsonData.thumbnail}
                        alt="Thumbnail"
                        className="w-full rounded-t-lg aspect-video object-cover mb-4"
                      />
                    )}
                  </Link>

                  <Link href={`/dashboard/new/${item.id}`}>
                    <h2 className="font-semibold text-xl text-primary mb-2">
                      {item.title.length > 78
                        ? `${item.title.substring(0, 78)}...`
                        : item.title}
                    </h2>
                  </Link>

                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>

                <div className="absolute bottom-4 right-4">
                  {loadingDelete[item.id] ? (
                    <Button variant={"destructive"} size="icon" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    <form onSubmit={(e) => deleteNote(e, item.id)}>
                      <input type="hidden" name="noteId" value={item.id} />
                      <TrashDelete />
                    </form>
                  )}
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Sentinel Element for Intersection Observer */}
      {hasMoreNotes && (
        <div ref={ref} className="flex justify-center items-center p-4">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </div>
      )}

    </div>
  );
}

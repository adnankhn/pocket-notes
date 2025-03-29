"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { File, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { loadCommunityNotes } from "@/app/actions"; // Import the action
import { useInView } from "react-intersection-observer";
import { CommunityNote } from "@/app/dashboard/community/page"; // Import the type
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components

interface CommunityBodyProps {
  initialNotes: CommunityNote[];
  notesPerPage: number;
}

export default function CommunityBody({ initialNotes, notesPerPage }: CommunityBodyProps) {
  const [notes, setNotes] = useState<CommunityNote[]>(initialNotes);
  const [skip, setSkip] = useState(notesPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreNotes, setHasMoreNotes] = useState(initialNotes.length === notesPerPage);
  const { ref, inView } = useInView();
  const [sortBy, setSortBy] = useState("latest"); // Default sort

  // Effect to load more notes when the sentinel element is in view
  useEffect(() => {
    // TODO: Add logic to reset notes and fetch based on sortBy when it changes
    if (inView && hasMoreNotes && !isLoading) {
      setIsLoading(true);
      loadCommunityNotes({ skip, take: notesPerPage }) // Use take instead of userId
        .then((newNotes: CommunityNote[] | null) => {
          if (newNotes && newNotes.length > 0) {
            setNotes((prevNotes) => [...prevNotes, ...newNotes]);
            setSkip((prevSkip) => prevSkip + newNotes.length);
            setHasMoreNotes(newNotes.length === notesPerPage);
          } else {
            setHasMoreNotes(false);
          }
        })
        .catch((error: any) => {
          console.error("Failed to load more community notes:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [inView, hasMoreNotes, isLoading, skip, notesPerPage, sortBy]); // Add sortBy dependency

  // Handle sort change (currently just updates state, no refetch logic yet)
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // TODO: Implement logic to reset notes, skip, hasMoreNotes and fetch first page based on new sort
    console.log("Sort changed to:", value); // Placeholder
    setNotes([]); // Clear notes for now
    setSkip(0);
    setHasMoreNotes(true); // Assume more notes exist for the new sort
    setIsLoading(true); // Trigger loading state
     loadCommunityNotes({ skip: 0, take: notesPerPage }) // Fetch first page
        .then((newNotes: CommunityNote[] | null) => {
          if (newNotes && newNotes.length > 0) {
            setNotes(newNotes);
            setSkip(newNotes.length);
            setHasMoreNotes(newNotes.length === notesPerPage);
          } else {
            setHasMoreNotes(false);
          }
        })
        .catch((error: any) => {
          console.error("Failed to load initial community notes after sort:", error);
           setHasMoreNotes(false); // Stop loading on error
        })
        .finally(() => {
          setIsLoading(false);
        });
  };


  return (
    <div className="grid items-start gap-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="font-bold text-xl md:text-3xl lg:text-4xl">
            Community Notes
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            Discover notes shared by the community
          </p>
        </div>
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            {/* Add other sort options later if needed */}
            {/* <SelectItem value="popular">Popular</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid or Empty State */}
      {notes.length === 0 && !isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            No community notes found.
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            Be the first to share a note!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
          {notes.map((item: CommunityNote) => (
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
                    {/* Handle potentially null title */}
                    {item.title ? (item.title.length > 78 ? `${item.title.substring(0, 78)}...` : item.title) : "Untitled Note"}
                  </h2>
                </Link>
                <p>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                  }).format(new Date(item.createdAt))}
                </p>
                {/* Add author info here if fetched */}
                {/* {item.User && <p className="text-sm text-muted-foreground">By: {item.User.name ?? 'Anonymous'}</p>} */}
              </div>
              {/* No delete button for community notes */}
            </Card>
          ))}
        </div>
      )}

      {/* Sentinel Element for Intersection Observer */}
      {hasMoreNotes && (
        <div ref={ref} className="flex justify-center items-center p-4">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </div>
      )}
       {!hasMoreNotes && notes.length > 0 && (
         <p className="text-center text-muted-foreground">No more notes to load.</p>
       )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { File } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TrashDelete } from "../components/Submitbuttons";
import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import refreshDashboard from "../actions";

interface DashboardContentProps {
  data: {
    Notes: {
      title: string;
      id: string;
      jsonData: any;
      createdAt: Date;
    }[];
    Subscription: {
      status: string;
      free_credits: number;
    } | null;
  } | null;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deletedNoteIds, setDeletedNoteIds] = useState<string[]>([]);
  const [loadingDelete, setLoadingDelete] = useState<{
    [noteId: string]: boolean;
  }>({});

  if (!data) return null;

  async function deleteNote(event: FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    setLoadingDelete((prevState) => ({ ...prevState, [noteId]: true }));

    // API to delete note
    // await fetch("https://firepocket.vercel.app/api/note", {
    await fetch("http://localhost:3000/api/note/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        noteId: noteId,
      }),
    });
    refreshDashboard();

    // Update local state to mark the note as deleted
    setLoadingDelete((prevState) => {
      const newState = { ...prevState };
      delete newState[noteId];
      return newState;
    });
    setDeletedNoteIds((prevNoteIds) => [...prevNoteIds, noteId]);
  }

  // Filter notes based on search query and whether they are deleted
  const filteredNotes = data.Notes.filter((note) => {
    const isDeleted = deletedNoteIds.includes(note.id);
    if (isDeleted) return false;

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

        {data?.Subscription?.status === "active" ||
         data?.Subscription?.free_credits > 0 ? (
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
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="focus-visible:ring-transparent"
      />

      {filteredNotes.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            No notes found matching the search query
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
          {filteredNotes.map(
            (item) =>
              // Check if the note ID is not in the deletedNoteIds array
              !deletedNoteIds.includes(item.id) && (
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
    </div>
  );
}

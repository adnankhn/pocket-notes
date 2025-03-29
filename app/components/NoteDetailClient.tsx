'use client'; // This component handles client-side interactions

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Share2, ExternalLink } from "lucide-react";
import Link from "next/link";
import SummaryComp from "@/app/components/SummaryComp";

// Re-define NoteData type here or import from a shared types file
type NoteData = {
  id: string;
  title: string | null;
  description: string | null;
  summary: string | null;
  jsonData: {
    title?: string | null;
    byline?: string | null;
    content?: string | null;
  } | null | any;
  url: string | null;
  is_published: boolean | null;
} | null;

interface NoteDetailClientProps {
  initialData: NoteData;
  // Add userId if needed for authorization checks within client component, though API should handle this
}

export default function NoteDetailClient({ initialData }: NoteDetailClientProps) {
  // Use initialData passed from the server component
  const [data, setData] = useState(initialData); // Keep local state if needed for updates
  const [isPublishing, setIsPublishing] = useState(false);
  // Initialize isPublished state based on the initial data prop
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);

  // Handle publish button click
  const handlePublish = async () => {
    if (!data?.id || isPublished) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/note', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: data.id,
          is_published: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text(); // Get more error details
        throw new Error(`Failed to publish note: ${response.status} ${errorData}`);
      }

      // Update local state to reflect the change
      setData(prevData => prevData ? { ...prevData, is_published: true } : null);
      setIsPublished(true);
      toast.success("Note successfully published to community");

    } catch (error) {
      console.error("Publishing error:", error);
      toast.error(`Failed to publish note. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Render the UI using the 'data' state
  if (!data) {
    // Handle case where initialData might be null (e.g., note not found)
    return <Card><CardHeader><CardTitle>Note not found</CardTitle></CardHeader><CardContent><p>The requested note could not be loaded.</p></CardContent><CardFooter><Button asChild variant="secondary"><Link href="/dashboard">Back</Link></Button></CardFooter></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>View Article</CardTitle>
        <Button
          onClick={handlePublish}
          disabled={isPublishing || isPublished}
          size="icon"
          variant={isPublished ? "ghost" : "outline"}
          title={isPublished ? "Already published" : "Publish to community"}
        >
          <Share2 className={`h-4 w-4 ${isPublished ? 'text-green-500' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-5">
        <div className="gap-y-2 flex flex-col">
          <Label>Title</Label>
          <Input
            required
            type="text"
            name="title"
            placeholder="Title for your note"
            defaultValue={data.title ?? ""}
            readOnly // Assuming title is read-only in this view
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="url">URL</Label>
          <div className="flex items-center gap-x-2">
            {data.url && (
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-1 text-primary hover:underline">
                <span>Visit Page</span>
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Original</TabsTrigger>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            {data.jsonData ? (
              <div className="article-content">
                <h1>Title: {data.jsonData.title ?? 'N/A'}</h1>
                <p>Byline: {data.jsonData.byline ?? 'N/A'}</p>
                {data.jsonData.content ? (
                  <div
                    className="prose lg:prose-base dark:prose-invert max-w-[800px] mx-auto prose-hr:hidden"
                    dangerouslySetInnerHTML={{ __html: data.jsonData.content }}
                  />
                ) : (
                  <p>No content available.</p>
                )}
              </div>
            ) : (
              <p>Original content not available.</p>
            )}
          </TabsContent>
          <TabsContent value="summary">
            <SummaryComp
              description={data.description ?? null}
              summary={data.jsonData?.summary ?? null}
              id={data.id}
              content={data.jsonData?.content ?? null}
              url={data.url ?? null}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back</Link>
        </Button>
        {/* Submit button for editing might be needed here if title/desc were editable */}
      </CardFooter>
    </Card>
  );
}

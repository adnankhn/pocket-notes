"use client";
import { useState } from "react";

import { SubmitButton } from "@/app/components/Submitbuttons";
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import SummaryComp from "./SummaryComp";

export default function NewNote({ userId }: { userId: string }) {
  const [jsonData, setjsonData] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  async function createNote(event: FormEvent<HTMLFormElement>, url: string) {
    event.preventDefault();
    // await fetch("https://firepocket.vercel.app/api/completion", {

    const res = await fetch("https://firepocket.vercel.app/api/note", {
    // const res = await fetch("http://localhost:3000/api/note/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        userId: userId,
      }),
    });
    const responsedata = await res.json();
    setjsonData(responsedata);
    setUrl(url);

  }

  return (
    <Card>
      <form onSubmit={(e) => createNote(e, e.target.url.value)}>
        <CardHeader>
          <CardTitle>New Link</CardTitle>
          <CardDescription>
            Right here you can now create your new notes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">
          <div className="gap-y-2 flex flex-col">
            <Label>URL</Label>
            <Input type="url" name="url" placeholder="URL for your note" />
          </div>
          {jsonData && (
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Original</TabsTrigger>
                <TabsTrigger value="summary">AI Summary</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <div className="article-content">
                  <h1>Title: {jsonData.jsonData.title}</h1>
                  <p>Byline: {jsonData.jsonData.byline}</p>
                  <div
                    className="prose lg:prose-base dark:prose-invert max-w-[800px] mx-auto prose-hr:hidden"
                    dangerouslySetInnerHTML={{
                      __html: jsonData.jsonData.content,
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="summary">
                {/* {data?.jsonData && (
                  <article className="prose lg:prose-base dark:prose-invert max-w-[800px] mx-auto prose-hr:hidden">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                 </article>
              )} */}

                <SummaryComp
                  description={jsonData.description}
                  id={jsonData.noteId}
                  content={jsonData.jsonData.content}
                  url={url}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        {jsonData ? (
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back</Link>
            </Button>
            {/* <SubmitButton /> */}
          </CardFooter>
        ) : (
          <CardFooter className="flex justify-between">
            <Button asChild variant="destructive">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <SubmitButton />
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
import { SubmitButton } from "@/app/components/Submitbuttons";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom'); 

export default async function NewNoteRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  let jsonData = null;


  async function postData(formData: FormData) {
    "use server";

    if (!user) {
      throw new Error("Not authorized");
    }

    
    
    const url = formData.get("url") as string; 

    async function fetchDataFromUrl(url: string) {
      const response = await fetch(`${url}`, {
        headers: {
          'origin': process.env.PRODUCTION_SERVER_URL as string, 
        },
      });
      const html = await response.text();
      const doc = new JSDOM(html, { url: url });
      
      const reader = new Readability(doc.window.document);
      const article = reader.parse();

      let thumbnail = null;

      const contentDoc = new JSDOM(article.content).window.document;
      const leadImage = contentDoc.querySelector('img');
      if (leadImage) {
        thumbnail = leadImage.src;
      }

      const metaTags = doc.window.document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]');
      if (metaTags.length > 0) {
        thumbnail = metaTags[0].getAttribute('content');
      }
    
      return {
        title: article.title,
        byline: article.byline,
        content: article.content,
        thumbnail : thumbnail
      };
    }

    
    const jsonData = await fetchDataFromUrl(url);

    const newNote = await prisma.note.create({
      data: {
        userId: user?.id,
        title: jsonData.title,
        url: url,
        jsonData: jsonData, 
      },
    });

    // return redirect(`/dashboard/new/${newNote.id}`);
    revalidatePath("/dasboard");
    // return redirect("/dashboard/");

    
  }

  
  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>New Link</CardTitle>
          <CardDescription>
            Right here you can now create your new notes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">

          <div className="gap-y-2 flex flex-col">
            <Label>URL</Label>
            <Input
              type="url"
              name="url"
              placeholder="URL for your note"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button asChild variant="destructive">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>

      {/* {jsonData && (
        <Card>
          <CardHeader>
            <CardTitle>Fetched Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Title: {jsonData["title"]}</p>
            <p>Byline: {jsonData["byline"]}</p>
            <div dangerouslySetInnerHTML={{ __html: jsonData["content"] }} /> 
          </CardContent>
        </Card>
      )} */}
    </Card>
  );
}

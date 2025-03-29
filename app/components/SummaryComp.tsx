"use client";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { saveSummary } from "@/app/actions"; // Import saveSummary

export default function SummaryComp({
  description,
  id,
  content,
  url,
  summary,
}: {
  description: string | null; // Allow null
  id: string;
  content: string | null; // Allow null
  url: string | null; // Allow null
  summary: string | null; // Allow null
}) {
  const [geminiResponse, setgeminiResponse] = useState<string>("");

  useEffect(() => {
    console.log("Component mounted. Content:", content);
    // Check if there is a cached summary in local storage
    const cachedSummary = localStorage.getItem(`summary_${id}`);
    if (cachedSummary) {
      setgeminiResponse(cachedSummary);
    } else {
      // Use description if available and not null/empty
      if (summary) {
        setgeminiResponse(summary);
      } else if (content) {
        console.log("Calling generateSummary...");
        generateSummary(content, url, id);
      }
    }
  }, []);

  async function generateSummary(content: string, url: string | null, id: string) {
    console.log("generateSummary called. Content:", content);
    await fetch("https://firepocket.vercel.app/api/completion", {

    // await fetch("http://localhost:3000/api/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: content,
        url: url,
        id: id,
      }),
    })
      .then(async (response: any) => {
        const reader = response.body?.getReader();
        let responseData = '';
        while (true) {
          const { done, value } = await reader?.read();
          if (done) {
            break;
          }
          const currentChunk = new TextDecoder().decode(value);
          responseData += currentChunk;
          setgeminiResponse((prev) => prev + currentChunk);
        }
        // Cache the summary in local storage
        localStorage.setItem(`summary_${id}`, responseData);
        // Save the summary to the database
        saveSummary({ noteId: id, summary: responseData }); // Call server action
      })
      .catch((error) => {
        console.error("Error generating summary:", error);
      });
  }

  return (
    <div>
      {geminiResponse !== "" && (
        <article className="prose lg:prose-base dark:prose-invert max-w-[800px] mx-auto prose-hr:hidden">
          <ReactMarkdown>{geminiResponse}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}

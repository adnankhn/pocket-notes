"use client";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

export default function SummaryComp({
  description,
  id,
  content,
  url,
}: {
  description: string;
  id: string;
  content: string;
  url: string;
}) {
  const [openAIResponse, setOpenAIResponse] = useState<string>("");

  useEffect(() => {
    console.log("Component mounted. Content:", content);
    if (description) {
        setOpenAIResponse(description);
    }
    else if (content) {
      console.log("Calling generateSummary...");
      generateSummary(content, url, id);
    }
  }, []);

  async function generateSummary(content: string, url: string, id: string) {
    console.log("generateSummary called. Content:", content);
    
    //   await fetch("http://localhost:3000/api/completion", {
        await fetch("https://firepocket.vercel.app/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          url: url,
          id: id,
        })
      })
      .then(async (response: any) => {
        const reader = response.body?.getReader();
        setOpenAIResponse("");
        while (true) {
          const { done, value } = await reader?.read();
          if(done) {
            break;
          }
          var currentChunk = new TextDecoder().decode(value);
          setOpenAIResponse((prev) => prev + currentChunk);
        }
      });
    }

  return (
    <div>
      {openAIResponse !== "" && (
        <article className="prose lg:prose-base dark:prose-invert max-w-[800px] mx-auto prose-hr:hidden">
          <ReactMarkdown>{openAIResponse}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}

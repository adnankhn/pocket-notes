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
    if (content) {
      console.log("Calling generateSummary...");
      generateSummary(content, url);
    }
  }, []);

  async function generateSummary(content: string, url: string) {
    console.log("generateSummary called. Content:", content);
    try {
      const response = await fetch("firepocket.vercel.app/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          url: url,
        }),
      });
      const responseData = await response.text();
      setOpenAIResponse(responseData);
    } catch (error) {
      console.error("Error in generateSummary:", error);
    }
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

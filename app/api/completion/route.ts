import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(request: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt, url, id } = await request.json();

  // Ask Google Generative AI for a streaming completion given the prompt
  const response = await genAI
    .getGenerativeModel({ model: 'gemini-pro'})
    // .getGenerativeModel({ model: 'gemini-pro' , generationConfig: { maxOutputTokens: 200 }})
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: "write a short summary of this article explaining the key takeaways and return the output in a well formated markdown format "+prompt }] }],
    });

  // Convert the response into a friendly text-stream
  // const stream = GoogleGenerativeAIStream(response);

  const stream = GoogleGenerativeAIStream(response, {
    onCompletion: async (completion: string) => {
      // This callback is called when the completion is ready
      // You can use this to save the final completion to your database

      await fetch("https://firepocket.vercel.app/api/save-db", {
      // const res = await fetch("http://localhost:3000/api/save-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completion: completion,
          url: url,
          id: id,
        }),
      });
    },
  });

  return new StreamingTextResponse(stream);
}

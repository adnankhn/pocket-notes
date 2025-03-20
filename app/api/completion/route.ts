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
    // .getGenerativeModel({ model: 'gemini-2.0-flash-001, gemini-1.5-flash-002,'})
    .getGenerativeModel({ model: 'gemini-1.5-flash-002' , generationConfig: { maxOutputTokens: 1000 }})
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: "give a short summary in under 150 words or less in few points of this article explaining the key takeaways  and return the output in a well formated markdown format and dont include anything else in output :"+prompt }] }],
    });

    // .generateContentStream({
    //   contents: [{ role: 'user', parts: [{ text: "tldr the output in markdown format and keep it short  :"+prompt }] }],
    // });

  // Convert the response into a friendly text-stream
  // const stream = GoogleGenerativeAIStream(response);

  const stream = GoogleGenerativeAIStream(response, {
    onCompletion: async (completion: string) => {
      // This callback is called when the completion is ready
      // You can use this to save the final completion to your database

      // await fetch("https://firepocket.vercel.app/api/save-db", {
     await fetch("http://localhost:3000/api/save-db", {
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

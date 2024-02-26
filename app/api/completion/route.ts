import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
 
const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(request: Request) {
  const {prompt} = await request.json();
 
  // Ask Google Generative AI for a streaming completion given the prompt
  const response = await genAI
    // .getGenerativeModel({ model: 'gemini-pro'})
    .getGenerativeModel({ model: 'gemini-pro' , generationConfig: { maxOutputTokens: 200 }})
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: "write a short summary of this article explaining the key takeaways and return the output in a well formated markdown format "+prompt }] }],
    });
  
 
  // Convert the response into a friendly text-stream
  const stream = GoogleGenerativeAIStream(response);

  return new StreamingTextResponse(stream);
}

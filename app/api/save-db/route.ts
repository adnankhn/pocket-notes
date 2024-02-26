import prisma from "@/app/lib/db";

export async function POST(request: Request) {
  const { url, id, completion } = await request.json();
  const existingNote = await prisma.note.findUnique({
    where: {
      id: id,
    },
  });

  if (completion && existingNote?.description === null) {
    await prisma.note.update({
      where: {
        id: id,
      },
      data: {
        description: completion,
      },
    });
  }

  return new Response(null, { status: 200 });
}

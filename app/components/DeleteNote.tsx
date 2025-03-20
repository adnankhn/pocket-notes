import { TrashDelete } from "../components/Submitbuttons";
import prisma from "../lib/db";
import { revalidatePath } from "next/cache";


export async function NoteDelete({id} : {id : string} ) {
    async function deleteNote() {
        // "use server";
    
    
        await prisma.note.delete({
          where: {
            id: id,
          },
        });
      }
  return (
    <div className="flex justify-end gap-x-4">
      <form action={deleteNote}>
        <input type="hidden" name="noteId" value={id} />
        <TrashDelete />
      </form>
    </div>
  );
}

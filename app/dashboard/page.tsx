import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "../lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { File } from "lucide-react";
import { Card } from "@/components/ui/card";

import { TrashDelete } from "../components/Submitbuttons";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import DashboardContent from "../components/DashboardBody";

const NOTES_PER_PAGE = 9; // Define batch size

async function getData(userId: string) {
  noStore();
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      free_credits: true, // Select free_credits from User
      Notes: {
        select: {
          title: true,
          id: true,
          // description: true,
          jsonData:true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: NOTES_PER_PAGE, // Fetch only the first batch
      },

      Subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  return data;
}

// async function SearchData(formData: FormData) {
//   "use server";

  
//   const { getUser } = getKindeServerSession();
//   const user = await getUser();
//   console.log(user?.id);


//   const searchQuery = formData.get("search") as string; 
//   console.log(searchQuery);
//   const data = await prisma.user.findUnique({
//     where: {
//       id: user?.id,
//     },
//     select: {
//       Notes: {
//         where: {
//           OR: [
//             { title: { contains: searchQuery, mode: 'insensitive' } }, 
//             { description: { contains: searchQuery, mode: 'insensitive' } }, 
            
//           ],
//         },
//         select: {
//           title: true,
//           id: true,
//           description: true,
//           jsonData: true,
//           createdAt: true,
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//       },
//       Subscription: {
//         select: {
//           status: true,
//         },
//       },
//     },
//   });
//   console.log(data);

//   return data;
// }


export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  console.log(user?.id);

  const data = await getData(user?.id as string);

  async function deleteNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    revalidatePath("/dasboard");
  }
  // Pass initial notes and user ID separately to the client component
  return (
    <DashboardContent 
      initialData={data} 
      userId={user?.id as string} 
    />
  //   <div className="grid items-start gap-y-8">
  //     <div className="flex items-center justify-between px-2">
  //       <div className="grid gap-1">
  //         <h1 className="font-bold text-xl md:text-3xl lg:text-4xl">Your Collection</h1>
  //         <p className="text-sm md:text-lg text-muted-foreground">Here you can see your saved URLs</p>
  //       </div>

  //       {data?.Subscription?.status === "active" ? (
  //         <Button asChild>
  //           <Link href="/dashboard/new">Save new URL</Link>
  //         </Button>
  //       ) : (
  //         <Button asChild>
  //           <Link href="/dashboard/billing">Create a new Note</Link>
  //         </Button>
  //       )}
  //     </div>

  //     {data?.Notes.length == 0 ? (
  //       <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
  //         <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
  //           <File className="w-10 h-10 text-primary" />
  //         </div>

  //         <h2 className="mt-6 text-xl font-semibold">
  //           You dont have any notes created
  //         </h2>
  //         <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
  //           You currently dont have any notes. please create some so that you
  //           can see them right here.
  //         </p>

  //         {data?.Subscription?.status === "active" ? (
  //           <Button asChild>
  //             <Link href="/dashboard/new">Create a new Note</Link>
  //           </Button>
  //         ) : (
  //           <Button asChild>
  //             <Link href="/dashboard/billing">Create a new Note</Link>
  //           </Button>
  //         )}
  //       </div>
  //     ) : (
  //       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 ">
  //         {data?.Notes.map((item) => (
  //           <Card
  //             key={item.id}
  //             className="flex items-center justify-between p-4"
  //           >
  //             <div className="w-full relative">
  //             <Link href={`/dashboard/new/${item.id}`}>

  //             {item.jsonData && item.jsonData.thumbnail && (
  //   <img src={item.jsonData.thumbnail} alt="Thumbnail" className="w-full rounded-t-lg aspect-video object-cover" />
  // )}          
  //             </Link>

  //             <div className="p-3">
  //               <Link href={`/dashboard/new/${item.id}`}>
  //                 <h2 className="font-semibold text-xl text-primary">
  //                   {item.title}
  //                 </h2>
  //               </Link>

  //               <p>
//                 {new Intl.DateTimeFormat("en-US", {
  //                   dateStyle: "full",
  //                 }).format(new Date(item.createdAt))}
  //               </p>
  //             </div>

  //             <div className="flex justify-end gap-x-4">
  //               <form action={deleteNote}>
  //                 <input type="hidden" name="noteId" value={item.id} />
  //                 <TrashDelete />
  //               </form>
  //             </div>

  //             </div>
  //           </Card>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  );
}

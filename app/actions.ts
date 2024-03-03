"use server";

import { revalidatePath } from "next/cache";

export default async function refreshdashboard() {
    revalidatePath("dashboard");
}
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { DISTRICTS } from "@/lib/config/site";
import {
  AddressError,
  deleteAddress,
  makeDefaultAddress,
  saveAddress,
} from "@/lib/services/addresses";
import type { ActionState } from "./helpers";

/**
 * Customer-side actions (deliberately separate from `lib/actions/*` admin actions):
 * they only ever touch the signed-in visitor's own records — never another customer's.
 */
async function currentCustomer() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to continue.");
  return user;
}

const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().max(30).optional(),
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone: z.string().trim().min(6, "Enter a phone number").max(24),
  address: z.string().trim().min(8, "Enter the full street address").max(300),
  area: z.string().trim().min(2, "Enter the area or thana").max(120),
  district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select the district" }) }),
  postcode: z.string().trim().max(10).optional().or(z.literal("")),
});

export async function saveAddressAction(input: unknown): Promise<ActionState> {
  try {
    const user = await currentCustomer();
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0]) || "form"] = issue.message;
      return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
    }
    await saveAddress(user.id, parsed.data);
    revalidatePath("/account/addresses");
    return { ok: true, message: parsed.data.id ? "Address updated." : "Address saved." };
  } catch (error) {
    if (error instanceof AddressError) return { ok: false, message: error.message };
    return { ok: false, message: (error as Error).message || "Could not save that address." };
  }
}

export async function deleteAddressAction(id: string): Promise<ActionState> {
  try {
    const user = await currentCustomer();
    await deleteAddress(user.id, id);
    revalidatePath("/account/addresses");
    return { ok: true, message: "Address removed." };
  } catch (error) {
    if (error instanceof AddressError) return { ok: false, message: error.message };
    return { ok: false, message: "Could not remove that address." };
  }
}

export async function makeDefaultAddressAction(id: string): Promise<ActionState> {
  try {
    const user = await currentCustomer();
    await makeDefaultAddress(user.id, id);
    revalidatePath("/account/addresses");
    return { ok: true, message: "Default address updated." };
  } catch (error) {
    if (error instanceof AddressError) return { ok: false, message: error.message };
    return { ok: false, message: "Could not update the default address." };
  }
}

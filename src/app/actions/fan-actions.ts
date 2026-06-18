"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMembership, getCurrentUser } from "@/lib/auth";
import {
  canEnterGiveaways,
  canRegisterMeetAndGreet,
} from "@/lib/membership";
import {
  createGiveawayEntry,
  createMeetGreetRegistration,
  getGiveawayById,
  getMeetGreetEventById,
} from "@/lib/repository";

export async function enterGiveaway(giveawayId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to enter." };
  }

  const membership = await getCurrentMembership();
  if (!canEnterGiveaways(membership, membership.isAdmin)) {
    return {
      error: "Active membership required. Apply from your dashboard membership page.",
    };
  }

  const giveaway = await getGiveawayById(giveawayId);
  if (!giveaway || giveaway.status !== "active") {
    return { error: "This giveaway is not active." };
  }

  if (new Date(giveaway.ends_at) < new Date()) {
    return { error: "This giveaway has ended." };
  }

  try {
    await createGiveawayEntry(user.id, giveawayId);
    revalidatePath(`/giveaways/${giveawayId}`);
    revalidatePath("/giveaways");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not enter giveaway." };
  }
}

export async function registerForEvent(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to register." };
  }

  const membership = await getCurrentMembership();
  if (!canRegisterMeetAndGreet(membership, membership.isAdmin)) {
    return {
      error: "Gold or Platinum membership is required for meet & greet registration.",
      upgrade: "gold" as const,
    };
  }

  const event = await getMeetGreetEventById(eventId);
  if (!event || event.status !== "upcoming") {
    return { error: "This event is not open for registration." };
  }

  try {
    const status = await createMeetGreetRegistration(user.id, eventId);
    revalidatePath(`/meet-and-greet/${eventId}`);
    revalidatePath("/meet-and-greet");
    revalidatePath("/dashboard");
    return { success: true, status };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not register." };
  }
}

import {
  getGiveawayById as getGiveaway,
  getGiveaways as listGiveaways,
  getMeetGreetEventById as getEvent,
  getMeetGreetEvents as listEvents,
} from "@/lib/repository";

export async function getGiveaways() {
  return listGiveaways();
}

export async function getGiveawayById(id: string) {
  return getGiveaway(id);
}

export async function getMeetGreetEvents() {
  return listEvents();
}

export async function getMeetGreetEventById(id: string) {
  return getEvent(id);
}

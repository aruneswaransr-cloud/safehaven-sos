// Local storage helpers for Saheli (no backend mode)
export type Contact = { id: string; name: string; phone: string };
export type AlertRecord = {
  id: string;
  triggeredAt: string;
  lat: number | null;
  lng: number | null;
  safeWord: string;
  note?: string;
  contactsNotified: number;
};
export type Profile = { name: string; phone: string };
export type TripState = {
  active: boolean;
  safeWord: string;
  note?: string;
  startedAt?: string;
};

const K = {
  profile: "saheli.profile",
  contacts: "saheli.contacts",
  alerts: "saheli.alerts",
  trip: "saheli.trip",
};

const read = <T>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export const getProfile = () => read<Profile | null>(K.profile, null);
export const setProfile = (p: Profile) => write(K.profile, p);

export const getContacts = () => read<Contact[]>(K.contacts, []);
export const setContacts = (c: Contact[]) => write(K.contacts, c);
export const addContact = (c: Omit<Contact, "id">) => {
  const all = getContacts();
  const next = [...all, { ...c, id: crypto.randomUUID() }];
  setContacts(next);
  return next;
};
export const removeContact = (id: string) => {
  const next = getContacts().filter((c) => c.id !== id);
  setContacts(next);
  return next;
};

export const getAlerts = () => read<AlertRecord[]>(K.alerts, []);
export const addAlert = (a: Omit<AlertRecord, "id">) => {
  const next = [{ ...a, id: crypto.randomUUID() }, ...getAlerts()].slice(0, 100);
  write(K.alerts, next);
  return next;
};

export const getTrip = () => read<TripState>(K.trip, { active: false, safeWord: "" });
export const setTrip = (t: TripState) => write(K.trip, t);
export const clearTrip = () => write(K.trip, { active: false, safeWord: "" });

export const isOnboarded = () => !!getProfile();

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, Phone } from "lucide-react";
import { addContact, getContacts, removeContact, type Contact } from "@/lib/storage";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,20}$/, "Use digits, spaces or +"),
});

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(getContacts());
  const [form, setForm] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setErrors({});
    setContacts(addContact(form));
    setForm({ name: "", phone: "" });
    toast.success(`${r.data.name} added`);
  };

  const del = (id: string, name: string) => {
    setContacts(removeContact(id));
    toast(`Removed ${name}`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Trusted contacts</h1>
        <p className="text-muted-foreground mt-1">
          These people receive a WhatsApp alert with your live location when you trigger an SOS.
        </p>
      </div>

      <form
        onSubmit={add}
        className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-soft"
      >
        <p className="font-semibold flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Add new contact
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="n">Name</Label>
            <Input
              id="n"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Mom, Dad, Sister..."
              className="mt-1.5 h-11 rounded-xl"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="p">Phone</Label>
            <Input
              id="p"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="mt-1.5 h-11 rounded-xl"
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>
        <Button type="submit" className="rounded-xl h-11 w-full sm:w-auto">
          Add contact
        </Button>
      </form>

      <div className="space-y-2">
        {contacts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No contacts yet.</p>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {c.phone}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => del(c.id, c.name)}
                className="text-destructive hover:bg-destructive/10 rounded-xl"
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

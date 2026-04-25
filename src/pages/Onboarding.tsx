import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight } from "lucide-react";
import { setProfile, addContact } from "@/lib/storage";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(8, "Enter a valid phone").max(20),
  contactName: z.string().trim().min(2, "Contact name required").max(80),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,20}$/, "Use digits, spaces or +"),
});

export default function Onboarding() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", contactName: "", contactPhone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setProfile({ name: form.name, phone: form.phone });
    addContact({ name: form.contactName, phone: form.contactPhone });
    toast.success(`Welcome, ${form.name}! You're all set.`);
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-glow border border-border p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Set up Saheli</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us who you are and add your first trusted contact.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Priya Sharma"
              className="mt-1.5 h-12 rounded-xl"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Your phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="mt-1.5 h-12 rounded-xl"
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-3 mt-4">First trusted contact</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cn">Contact name</Label>
                <Input
                  id="cn"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Mom"
                  className="mt-1.5 h-12 rounded-xl"
                />
                {errors.contactName && (
                  <p className="text-xs text-destructive mt-1">{errors.contactName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cp">Contact phone</Label>
                <Input
                  id="cp"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+91 98765 12345"
                  className="mt-1.5 h-12 rounded-xl"
                />
                {errors.contactPhone && (
                  <p className="text-xs text-destructive mt-1">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-soft mt-2">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}

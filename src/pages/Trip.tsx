import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, MapPin, Phone, AlertTriangle, Shield, Square } from "lucide-react";
import {
  getContacts,
  getProfile,
  getTrip,
  setTrip,
  clearTrip,
  addAlert,
} from "@/lib/storage";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";

type Phase = "setup" | "active" | "emergency";

export default function Trip() {
  const nav = useNavigate();
  const profile = getProfile();
  const contacts = getContacts();

  const existing = getTrip();
  const [phase, setPhase] = useState<Phase>(existing.active ? "active" : "setup");
  const [safeWord, setSafeWord] = useState(existing.safeWord || "bachao");
  const [note, setNote] = useState(existing.note || "");

  const matchWords = useMemo(() => [safeWord], [safeWord]);
  const { coords, error: geoErr, getCurrent } = useGeolocation(phase !== "setup");

  const trigger = async () => {
    setPhase("emergency");
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const c = coords ?? (await getCurrent());
      lat = c.lat;
      lng = c.lng;
    } catch {
      /* allow without location */
    }
    addAlert({
      triggeredAt: new Date().toISOString(),
      lat,
      lng,
      safeWord,
      note,
      contactsNotified: contacts.length,
    });
    // Try to vibrate
    if ("vibrate" in navigator) navigator.vibrate?.([400, 100, 400, 100, 400]);
    toast.error("EMERGENCY TRIGGERED — alert ready to send");
  };

  const { listening, supported, transcript, start, stop } = useSpeechRecognition({
    matchWords,
    onMatch: () => {
      if (phase === "active") trigger();
    },
  });

  useEffect(() => {
    if (phase === "active" && supported) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, supported]);

  const startTrip = () => {
    if (!profile) return nav("/onboarding");
    if (contacts.length === 0) {
      toast.error("Add at least one trusted contact first");
      return nav("/contacts");
    }
    if (safeWord.trim().length < 2) {
      toast.error("Pick a longer safe word");
      return;
    }
    setTrip({ active: true, safeWord: safeWord.trim(), note, startedAt: new Date().toISOString() });
    setPhase("active");
  };

  const endTrip = () => {
    stop();
    clearTrip();
    setPhase("setup");
    toast.success("Trip ended. You're safe.");
  };

  const safeCancel = () => {
    setPhase("active");
  };

  // SETUP --------------------------------------------------------
  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Start a trip</h1>
          <p className="text-muted-foreground mt-1">
            Saheli will listen for your safe word and watch your location.
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-soft">
          <div>
            <Label htmlFor="sw">Your safe word</Label>
            <Input
              id="sw"
              value={safeWord}
              onChange={(e) => setSafeWord(e.target.value)}
              placeholder="bachao"
              className="mt-1.5 h-12 rounded-xl text-lg font-semibold"
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Pick something you'd never say casually. Shout this aloud to trigger SOS.
            </p>
          </div>
          <div>
            <Label htmlFor="nt">Where are you going? (optional)</Label>
            <Textarea
              id="nt"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Going from Andheri station to home, ETA 9:30pm"
              className="mt-1.5 rounded-xl"
              maxLength={300}
            />
          </div>
        </div>

        {!supported && (
          <div className="rounded-2xl border border-emergency/30 bg-emergency/5 p-4 text-sm">
            <p className="font-semibold text-emergency mb-1">Voice detection unavailable</p>
            <p className="text-muted-foreground">
              Your browser doesn't support voice recognition. Use Chrome or Edge — you can still use
              the panic button.
            </p>
          </div>
        )}

        <Button
          onClick={startTrip}
          size="lg"
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-glow bg-gradient-hero"
        >
          <Shield className="w-5 h-5 mr-2" /> Start trip
        </Button>
      </div>
    );
  }

  // ACTIVE -------------------------------------------------------
  if (phase === "active") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4 py-6">
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 rounded-full ${listening ? "animate-pulse-ring" : ""} bg-primary/30`}
            />
            <div
              className={`relative w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow ${listening ? "animate-pulse-mic" : ""}`}
            >
              {listening ? (
                <Mic className="w-14 h-14 text-primary-foreground" />
              ) : (
                <MicOff className="w-14 h-14 text-primary-foreground" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Listening for</p>
            <p className="text-3xl font-bold mt-1">"{safeWord}"</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Keep this tab open. Shout your safe word to trigger SOS.
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div className="text-sm flex-1 min-w-0">
            {coords ? (
              <>
                <p className="font-medium">Location locked</p>
                <p className="text-muted-foreground text-xs truncate">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (±{Math.round(coords.accuracy)}m)
                </p>
              </>
            ) : geoErr ? (
              <p className="text-emergency">Location: {geoErr}</p>
            ) : (
              <p className="text-muted-foreground">Getting your location…</p>
            )}
          </div>
        </div>

        {transcript && (
          <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            <span className="font-semibold">Heard:</span> {transcript.slice(-120)}
          </div>
        )}

        <Button
          onClick={trigger}
          size="lg"
          className="w-full h-16 rounded-2xl text-lg font-bold bg-gradient-emergency text-emergency-foreground shadow-emergency"
        >
          <AlertTriangle className="w-6 h-6 mr-2" /> PANIC — Trigger SOS
        </Button>
        <Button
          onClick={endTrip}
          variant="outline"
          size="lg"
          className="w-full h-12 rounded-2xl"
        >
          <Square className="w-4 h-4 mr-2" /> I'm safe — end trip
        </Button>
      </div>
    );
  }

  // EMERGENCY ----------------------------------------------------
  return (
    <EmergencyView
      profile={profile}
      contacts={contacts}
      coords={coords}
      onCancel={safeCancel}
      onEnd={endTrip}
    />
  );
}

function EmergencyView({
  profile,
  contacts,
  coords,
  onCancel,
  onEnd,
}: {
  profile: { name: string; phone: string } | null;
  contacts: { id: string; name: string; phone: string }[];
  coords: { lat: number; lng: number } | null;
  onCancel: () => void;
  onEnd: () => void;
}) {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const locUrl = coords
    ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
    : "(location unavailable)";
  const message = `🚨 EMERGENCY: ${profile?.name ?? "Someone you know"} triggered a Saheli safety alert. Live location: ${locUrl}. Time: ${new Date().toLocaleString()}. Please help or call police 100.`;

  const waLink = (phone: string) =>
    `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
  const smsLink = (phone: string) =>
    `sms:${phone.replace(/\s/g, "")}?body=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-emergency overflow-y-auto">
      <div className="min-h-full p-5 flex flex-col gap-4 max-w-md mx-auto text-emergency-foreground">
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-bold">
            <AlertTriangle className="w-4 h-4" /> EMERGENCY MODE
          </div>
          <h1 className="text-3xl font-bold mt-4">Help is one tap away</h1>
          <p className="text-sm opacity-90 mt-1">
            Call police now and notify your contacts.
          </p>
        </div>

        <a
          href="tel:100"
          autoFocus
          className="block w-full rounded-3xl bg-white text-emergency text-center py-6 font-bold text-2xl shadow-2xl active:scale-95 transition-smooth"
        >
          <Phone className="w-7 h-7 inline-block mr-2" />
          CALL POLICE 100
        </a>

        <div className="rounded-2xl bg-white/15 backdrop-blur p-4 text-sm">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Your location
          </p>
          {coords ? (
            <a
              href={locUrl}
              target="_blank"
              rel="noreferrer"
              className="underline opacity-95 break-all"
            >
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </a>
          ) : (
            <p className="opacity-90">Location not available yet.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
          <p className="font-semibold mb-3">Notify trusted contacts</p>
          {contacts.length === 0 ? (
            <p className="text-sm opacity-90">No contacts saved.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-white/15 p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs opacity-90 truncate">{c.phone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={waLink(c.phone)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setSentMap((m) => ({ ...m, [c.id]: true }))}
                      className="px-3 py-2 rounded-lg bg-[hsl(152_60%_42%)] text-white text-xs font-semibold"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={smsLink(c.phone)}
                      onClick={() => setSentMap((m) => ({ ...m, [c.id]: true }))}
                      className="px-3 py-2 rounded-lg bg-white text-emergency text-xs font-semibold"
                    >
                      SMS
                    </a>
                    <a
                      href={`tel:${c.phone.replace(/\s/g, "")}`}
                      className="px-3 py-2 rounded-lg bg-white/30 text-white text-xs font-semibold"
                    >
                      Call
                    </a>
                  </div>
                  {sentMap[c.id] && (
                    <span className="text-[10px] opacity-90">sent</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={onCancel}
            className="rounded-2xl bg-white/20 backdrop-blur py-4 font-semibold"
          >
            False alarm
          </button>
          <button
            onClick={onEnd}
            className="rounded-2xl bg-white text-emergency py-4 font-semibold"
          >
            I'm safe now
          </button>
        </div>
        <p className="text-xs text-center opacity-80 pb-6 mt-2">
          Tip: tap WhatsApp/SMS to send the pre-filled alert with your live location.
        </p>
      </div>
    </div>
  );
}

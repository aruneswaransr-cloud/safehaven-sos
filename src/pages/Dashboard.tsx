import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Users, History, Mic, AlertCircle } from "lucide-react";
import { getProfile, getContacts, getAlerts, getTrip } from "@/lib/storage";

export default function Dashboard() {
  const profile = getProfile();
  const contacts = getContacts();
  const alerts = getAlerts();
  const trip = getTrip();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="text-muted-foreground">Hi {profile?.name?.split(" ")[0] ?? "there"} 👋</p>
        <h1 className="text-3xl font-bold mt-1">Stay safe today</h1>
      </div>

      {/* Hero status card */}
      <div className="rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-3 mb-2 opacity-90">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">
            {trip.active ? "Trip in progress" : "Ready when you are"}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-1">
          {trip.active ? `Listening for "${trip.safeWord}"` : "Start a safety trip"}
        </h2>
        <p className="opacity-90 text-sm mb-6">
          {trip.active
            ? "Your microphone is listening. Tap to manage."
            : "Pick a safe word, share your location, and let Saheli watch over you."}
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="rounded-full h-12 px-7 font-semibold"
        >
          <Link to="/trip">
            <Mic className="w-4 h-4 mr-2" />
            {trip.active ? "Open trip" : "Start trip"}
          </Link>
        </Button>
      </div>

      {contacts.length === 0 && (
        <div className="rounded-2xl border border-emergency/30 bg-emergency/5 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-emergency shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Add a trusted contact</p>
            <p className="text-muted-foreground">
              You need at least one contact before starting a trip.{" "}
              <Link to="/contacts" className="text-primary font-medium underline">
                Add now
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/contacts"
          className="p-6 rounded-2xl bg-gradient-card border border-border shadow-soft hover:shadow-glow transition-smooth"
        >
          <Users className="w-6 h-6 text-primary mb-3" />
          <p className="text-2xl font-bold">{contacts.length}</p>
          <p className="text-sm text-muted-foreground">Trusted contact{contacts.length === 1 ? "" : "s"}</p>
        </Link>
        <Link
          to="/alerts"
          className="p-6 rounded-2xl bg-gradient-card border border-border shadow-soft hover:shadow-glow transition-smooth"
        >
          <History className="w-6 h-6 text-primary mb-3" />
          <p className="text-2xl font-bold">{alerts.length}</p>
          <p className="text-sm text-muted-foreground">Past alert{alerts.length === 1 ? "" : "s"}</p>
        </Link>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Quick safety tips</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Choose a safe word you'd never use casually (e.g. <em>bachao</em>, <em>red sky</em>).</li>
          <li>• Allow microphone & location permission when starting a trip.</li>
          <li>• Keep your phone screen on; browser tabs stop listening when closed.</li>
          <li>• Test with a friend the first time so you know what to expect.</li>
        </ul>
      </div>
    </div>
  );
}

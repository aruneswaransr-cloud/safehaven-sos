import { getAlerts } from "@/lib/storage";
import { History, MapPin } from "lucide-react";

export default function Alerts() {
  const alerts = getAlerts();
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Alert history</h1>
        <p className="text-muted-foreground mt-1">All SOS triggers from this device.</p>
      </div>
      {alerts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No alerts yet — stay safe!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="rounded-2xl bg-card border border-border p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Safe word: "{a.safeWord}"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.triggeredAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emergency/10 text-emergency font-medium">
                  {a.contactsNotified} contact{a.contactsNotified === 1 ? "" : "s"}
                </span>
              </div>
              {a.note && <p className="text-sm mt-2 text-muted-foreground italic">"{a.note}"</p>}
              {a.lat != null && a.lng != null ? (
                <a
                  href={`https://maps.google.com/?q=${a.lat},${a.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                >
                  <MapPin className="w-4 h-4" /> View on map
                </a>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">Location unavailable</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

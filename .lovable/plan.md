## Women's Safety Website — Build Plan

A safety companion app where users register, save trusted contacts, start a "trip" with a custom safe word, and trigger emergency alerts (SMS to contacts + one-tap call to police) by shouting the safe word.

### Important browser limitations (must read)
Browsers **cannot** auto-dial phone calls or send SMS silently. We work around this by:
- **Auto SMS to contacts** → sent server-side via Twilio (real SMS with live location)
- **Police call (100)** → a large auto-focused `tel:100` button appears the instant the safe word is detected; user taps once to connect
- **Voice detection** → uses Web Speech API (works best in Chrome/Edge, requires mic permission, must keep tab open)

### Design
Calm + trustworthy: soft purple/lavender primary with coral accent for emergency actions, rounded cards, generous spacing, large legible type. All colors via semantic tokens in `index.css` + `tailwind.config.ts`.

### Pages & flow
```text
/              → Landing (hero, features, CTA)
/auth          → Sign up / Log in (email + password)
/dashboard     → Overview: status card, quick "Start trip", recent alerts
/contacts      → Add / edit / delete trusted contacts (name + phone)
/trip          → Configure & start a trip: pick safe word, destination note,
                 START TRIP button → live listening screen with mic indicator
/alerts        → History of past triggered alerts with timestamp + location
```

### Key behaviors
1. **Auth**: email/password via Lovable Cloud. Auto-create profile row on signup.
2. **Contacts**: at least 1 required before starting a trip; phone validated in E.164 format (+91…).
3. **Trip mode**:
   - User types a safe word (e.g. "help" / "bachao") + optional note.
   - Click START → browser asks for mic + location permission.
   - Continuous speech recognition runs; transcript matched against safe word (case-insensitive, fuzzy).
   - Big visible "Listening…" indicator + manual **PANIC** button as fallback.
4. **On trigger**:
   - Capture current GPS coordinates (`navigator.geolocation`).
   - Call edge function `send-emergency-alert` → Twilio sends SMS to every saved contact:
     *"EMERGENCY: {name} triggered a safety alert. Live location: https://maps.google.com/?q={lat},{lng}. Time: {time}"*
   - Screen flips to red emergency view with a giant **CALL POLICE (100)** `tel:` button (auto-focused).
   - Alert logged to `alerts` table.
5. **Stop trip**: user clicks "I'm safe" → state cleared.

### Backend (Lovable Cloud)
Tables:
- `profiles` (id → auth.users, full_name, phone)
- `contacts` (id, user_id, name, phone)
- `trips` (id, user_id, safe_word, note, started_at, ended_at, status)
- `alerts` (id, user_id, trip_id, lat, lng, triggered_at)

RLS: every table — users can only read/write their own rows. Roles table not needed (no admin).

Edge function: `send-emergency-alert` — validates JWT, reads contacts for the user, sends SMS via Twilio gateway, inserts alert row.

### Integrations needed
- **Lovable Cloud** (auth + DB + edge function) — auto-enabled
- **Twilio connector** — for sending real SMS. After plan approval I'll trigger the connector picker so you can connect your Twilio account (you'll need a Twilio phone number that can send SMS to India).

### Tech notes
- Web Speech API wrapped in a `useSpeechRecognition` hook with auto-restart on end.
- Geolocation requested with `enableHighAccuracy: true`.
- Trip state persisted in `localStorage` so accidental refresh resumes listening.
- All forms validated with `zod`.
- Toast notifications via existing `sonner`.

### Out of scope (browser can't do it)
- Truly silent automatic outbound phone calls
- Background listening when tab is closed or phone is locked (would need a native app — Capacitor can be added later)

### Build order
1. Design system (colors, tokens) + landing page
2. Auth + profiles table
3. Contacts CRUD page
4. Trips + alerts schema
5. Trip configuration + speech recognition + geolocation
6. Twilio connector + `send-emergency-alert` edge function
7. Emergency screen with police call button
8. Alerts history page

Ready to build when you approve.
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mic, MapPin, PhoneCall, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { isOnboarded } from "@/lib/storage";

const features = [
  {
    icon: Mic,
    title: "Voice-activated SOS",
    desc: "Pick a personal safe word. Shout it and Saheli triggers your emergency plan instantly.",
  },
  {
    icon: MapPin,
    title: "Live location",
    desc: "Your real-time GPS coordinates are captured and shared with your trusted circle.",
  },
  {
    icon: PhoneCall,
    title: "One-tap police call",
    desc: "A giant call button to dial 100 appears the moment your safe word is detected.",
  },
  {
    icon: Users,
    title: "Trusted contacts",
    desc: "Save important people. They get a WhatsApp alert with your location in one click.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Saheli — Voice-Activated Women's Safety App";
    const desc = document.querySelector('meta[name="description"]');
    const content =
      "Saheli protects you with a personal safe word. Shout it and instantly alert your trusted contacts and call police 100 with your live location.";
    if (desc) desc.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  const cta = isOnboarded() ? "/dashboard" : "/onboarding";

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Shield className="w-7 h-7 text-primary" />
          Saheli
        </div>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to={cta}>Open app</Link>
        </Button>
      </header>

      <section className="container py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
            <Sparkles className="w-4 h-4" /> Built for women, by design
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Your voice is the{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">panic button</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Saheli listens for your secret safe word while you travel. Shout it and your trusted
            people receive your live location — and a one-tap call to police 100 is ready on screen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base shadow-glow"
              onClick={() => navigate(cta)}
            >
              Get started — it's free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-14 px-8 text-base"
              asChild
            >
              <a href="#how">How it works</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Works in Chrome / Edge. Microphone & location permission required.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-hero rounded-[2.5rem] rotate-3 opacity-90" />
          <div className="relative bg-card rounded-[2.5rem] p-8 shadow-glow border border-border animate-float">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-soft p-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full animate-pulse-ring bg-emergency/30" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-emergency flex items-center justify-center shadow-emergency">
                  <Mic className="w-10 h-10 text-emergency-foreground" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Listening for</p>
                <p className="text-3xl font-bold mt-1">"bachao"</p>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-hero rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground">Trip active · 12 min</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How Saheli protects you</h2>
          <p className="text-muted-foreground mt-3">Four simple layers of safety, always ready.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-3xl bg-gradient-card border border-border shadow-soft hover:shadow-glow transition-smooth"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="rounded-[2rem] bg-gradient-hero p-10 md:p-16 text-center text-primary-foreground shadow-glow">
          <h2 className="text-3xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight">
            Don't walk alone. Walk with Saheli.
          </h2>
          <p className="mt-4 opacity-90 max-w-xl mx-auto">
            Set up your safe word and trusted circle in under a minute.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 rounded-full h-14 px-10 text-base font-semibold"
            onClick={() => navigate(cta)}
          >
            Set up Saheli now
          </Button>
        </div>
      </section>

      <footer className="container py-8 text-center text-sm text-muted-foreground">
        Saheli · Stay aware. Stay heard. Stay safe.
      </footer>
    </div>
  );
}

import { useState, FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const RECIPIENT = "katarzyna.slupecka@amu.edu.pl";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name, email and message.",
        variant: "destructive",
      });
      return;
    }
    const finalSubject = subject.trim() || "DwC Data Quest — question from contact form";
    const body =
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `${message}\n`;
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    toast({
      title: "Opening your email app",
      description: `Your message to ${RECIPIENT} is ready to send.`,
    });
  };

  return (
    <section aria-labelledby="contact-us-heading" className="mt-12">
      <Card className="max-w-2xl mx-auto border-primary/30">
        <CardHeader>
          <CardTitle id="contact-us-heading" className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            Contact us
          </CardTitle>
          <CardDescription>
            Have a question about the game or the Darwin Core standard? Send us a message — we will reply to{" "}
            <a className="underline" href={`mailto:${RECIPIENT}`}>{RECIPIENT}</a>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Your name</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Your email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject (optional)</Label>
              <Input
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
                rows={5}
              />
            </div>
            <Button type="submit" variant="neon" className="w-full sm:w-auto">
              <Send className="h-4 w-4" aria-hidden="true" />
              Send message
            </Button>
            <p className="text-xs text-muted-foreground">
              This form opens your default email app with the message pre-filled. No data is stored on our servers.
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

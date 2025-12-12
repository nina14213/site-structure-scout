import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-border/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="text-primary" size={20} />
          <span className="text-muted-foreground">
            Projekt edukacyjny AMUNATCOLL
          </span>
        </div>
        <p className="text-sm text-muted-foreground/70">
          Adam Mickiewicz University · Ucz się standardu GBIF Darwin Core poprzez zabawę!
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg">CriptoBot</span>
        </div>
        <Button variant="hero" size="sm">
          Começar agora
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

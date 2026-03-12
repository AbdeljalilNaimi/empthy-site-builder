import { motion } from "framer-motion";
import { Bot, User, Copy, ThumbsUp, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

export function ChatMessage({ role, content, timestamp, isEmergency }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 group",
        role === "user" ? "flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
          role === "assistant" 
            ? "bg-gradient-to-br from-teal-500 to-cyan-500" 
            : "bg-gradient-to-br from-primary to-primary/80"
        )}
      >
        {role === "assistant" ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </motion.div>

      {/* Message bubble */}
      <div className={cn("flex flex-col max-w-[75%]", role === "user" ? "items-end" : "items-start")}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md",
            role === "assistant" 
              ? "bg-muted/60 backdrop-blur-sm rounded-tl-sm" 
              : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm",
            isEmergency && "border-2 border-destructive/50 bg-destructive/10"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </motion.div>

        {/* Actions & timestamp */}
        <div className={cn(
          "flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity",
          role === "user" ? "flex-row-reverse" : ""
        )}>
          <span className="text-xs text-muted-foreground">{formatTime(timestamp)}</span>
          
          {role === "assistant" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6", liked && "text-teal-500")}
                onClick={() => setLiked(!liked)}
              >
                <ThumbsUp className={cn("h-3 w-3", liked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

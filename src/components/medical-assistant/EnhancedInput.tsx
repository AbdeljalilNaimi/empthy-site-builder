import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function EnhancedInput({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = "Décrivez vos symptômes ou posez une question...",
  maxLength = 1000
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border-2 transition-all duration-300 bg-background/80 backdrop-blur-sm",
        isFocused 
          ? "border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]" 
          : "border-border hover:border-teal-500/30"
      )}
      animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-teal-500/5 pointer-events-none"
        />
      )}

      <div className="relative flex items-end gap-2 p-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-teal-500 transition-colors"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[120px] py-1.5"
            disabled={isLoading}
          />
        </div>

        {/* Voice button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-teal-500 transition-colors"
          disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={onSend}
            disabled={!value.trim() || isLoading}
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl flex-shrink-0 transition-all duration-300",
              value.trim() && !isLoading
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Character counter */}
      <div className="absolute bottom-1 right-16 text-[10px] text-muted-foreground/50">
        {value.length}/{maxLength}
      </div>
    </motion.div>
  );
}

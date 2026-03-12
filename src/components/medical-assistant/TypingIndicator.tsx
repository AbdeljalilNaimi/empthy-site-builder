import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <motion.span
          className="w-2 h-2 bg-teal-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-2 h-2 bg-teal-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-2 h-2 bg-teal-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
}

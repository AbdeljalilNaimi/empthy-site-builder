import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {questions.slice(0, 3).map((question, index) => (
        <motion.button
          key={question}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(question)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-full",
            "bg-teal-500/10 text-teal-700 dark:text-teal-300",
            "border border-teal-500/20 hover:border-teal-500/40",
            "transition-all duration-200 hover:bg-teal-500/15",
            "shadow-sm hover:shadow"
          )}
        >
          {question}
        </motion.button>
      ))}
    </motion.div>
  );
}

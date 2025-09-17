import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Suggestions.displayName = "Suggestions";

interface SuggestionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  suggestion: string;
  onClick?: (suggestion: string) => void;
}

const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ className, suggestion, onClick, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "h-auto p-4 text-left justify-start whitespace-normal",
        className
      )}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {suggestion}
    </Button>
  )
);
Suggestion.displayName = "Suggestion";

export { Suggestion, Suggestions };

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Actions = React.forwardRef<HTMLDivElement, ActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Actions.displayName = "Actions";

interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children: React.ReactNode;
}

const Action = React.forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, label, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
      title={label}
      {...props}
    >
      {children}
    </Button>
  )
);
Action.displayName = "Action";

export { Action, Actions };

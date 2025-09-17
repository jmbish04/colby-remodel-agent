import * as React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 24, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    />
  )
);
Loader.displayName = "Loader";

export { Loader };

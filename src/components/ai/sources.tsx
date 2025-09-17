import * as React from "react"
import { ExternalLink, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Sources = React.forwardRef<HTMLDivElement, SourcesProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Collapsible>
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          {...props}
        >
          {children}
        </div>
      </Collapsible>
    )
  }
)
Sources.displayName = "Sources"

interface SourcesTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
  count: number
}

const SourcesTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  SourcesTriggerProps
>(({ className, count, ...props }, ref) => {
  return (
    <CollapsibleTrigger asChild>
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "h-auto p-2 text-xs text-muted-foreground hover:text-foreground",
          className
        )}
        {...props}
      >
        <FileText className="mr-1 h-3 w-3" />
        {count} source{count !== 1 ? 's' : ''}
      </Button>
    </CollapsibleTrigger>
  )
})
SourcesTrigger.displayName = "SourcesTrigger"

interface SourcesContentProps extends React.ComponentProps<typeof CollapsibleContent> {
  children: React.ReactNode
}

const SourcesContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  SourcesContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <CollapsibleContent
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      <div className="grid gap-2">
        {children}
      </div>
    </CollapsibleContent>
  )
})
SourcesContent.displayName = "SourcesContent"

interface SourceProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string
  href: string
}

const Source = React.forwardRef<HTMLAnchorElement, SourceProps>(
  ({ className, title, href, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 rounded-md border bg-muted/50 p-3 text-sm transition-colors hover:bg-muted",
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground truncate">{href}</div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>
    )
  }
)
Source.displayName = "Source"

export { Sources, SourcesTrigger, SourcesContent, Source }

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
	isStreaming?: boolean;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
	(
		{ className, isStreaming, defaultOpen = false, children, ...props },
		ref,
	) => {
		const [open, setOpen] = React.useState(defaultOpen);

		return (
			<Collapsible open={open} onOpenChange={setOpen}>
				<div
					ref={ref}
					className={cn(
						"border rounded-lg bg-muted/50 p-3 my-2",
						isStreaming && "animate-pulse",
						className,
					)}
					{...props}
				>
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							className="w-full justify-start p-0 h-auto font-normal"
						>
							<div className="flex items-center gap-2">
								{open ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
								<Brain className="h-4 w-4" />
								<span className="text-sm font-medium">Reasoning</span>
								{isStreaming && (
									<div className="ml-auto flex items-center gap-1">
										<div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
										<span className="text-xs text-muted-foreground">
											Thinking...
										</span>
									</div>
								)}
							</div>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="pt-2">{children}</CollapsibleContent>
				</div>
			</Collapsible>
		);
	},
);
Reasoning.displayName = "Reasoning";

const ReasoningTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
	<Button
		ref={ref}
		variant="ghost"
		size="sm"
		className={cn("h-6 px-2 text-xs", className)}
		{...props}
	>
		<Brain className="h-3 w-3 mr-1" />
		Show reasoning
	</Button>
));
ReasoningTrigger.displayName = "ReasoningTrigger";

const ReasoningContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"text-sm text-muted-foreground whitespace-pre-wrap",
			className,
		)}
		{...props}
	/>
));
ReasoningContent.displayName = "ReasoningContent";

export { Reasoning, ReasoningContent, ReasoningTrigger };

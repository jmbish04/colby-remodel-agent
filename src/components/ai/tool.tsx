import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    ChevronRight,
    Clock,
    Wrench,
    XCircle
} from "lucide-react";
import * as React from "react";

interface ToolProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultOpen?: boolean;
	children: React.ReactNode;
}

const Tool = React.forwardRef<HTMLDivElement, ToolProps>(
	({ className, defaultOpen = false, children, ...props }, ref) => {
		const [open, setOpen] = React.useState(defaultOpen);

		return (
			<Collapsible open={open} onOpenChange={setOpen}>
				<div
					ref={ref}
					className={cn("border rounded-lg bg-background p-4", className)}
					{...props}
				>
					{children}
				</div>
			</Collapsible>
		);
	},
);
Tool.displayName = "Tool";

interface ToolHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	type?: string;
	state?: string;
}

const ToolHeader = React.forwardRef<HTMLDivElement, ToolHeaderProps>(
	({ className, type, state, ...props }, ref) => {
		const getStateIcon = () => {
			switch (state) {
				case "output-available":
					return <CheckCircle className="h-4 w-4 text-green-500" />;
				case "error":
					return <XCircle className="h-4 w-4 text-red-500" />;
				default:
					return <Clock className="h-4 w-4 text-yellow-500" />;
			}
		};

		return (
			<CollapsibleTrigger asChild>
				<div
					ref={ref}
					className={cn(
						"flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded",
						className,
					)}
					{...props}
				>
					<ChevronRight className="h-4 w-4" />
					<Wrench className="h-4 w-4" />
					<span className="font-medium capitalize">
						{type?.replace("tool-", "") || "Tool"}
					</span>
					{getStateIcon()}
				</div>
			</CollapsibleTrigger>
		);
	},
);
ToolHeader.displayName = "ToolHeader";

const ToolContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<CollapsibleContent>
		<div ref={ref} className={cn("pt-2 space-y-3", className)} {...props} />
	</CollapsibleContent>
));
ToolContent.displayName = "ToolContent";

interface ToolInputProps extends React.HTMLAttributes<HTMLDivElement> {
	input?: any;
}

const ToolInput = React.forwardRef<HTMLDivElement, ToolInputProps>(
	({ className, input, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("p-3 bg-muted rounded-md", className)}
			{...props}
		>
			<div className="text-sm font-medium mb-1">Input:</div>
			<pre className="text-xs whitespace-pre-wrap">
				{JSON.stringify(input, null, 2)}
			</pre>
		</div>
	),
);
ToolInput.displayName = "ToolInput";

interface ToolOutputProps extends React.HTMLAttributes<HTMLDivElement> {
	output?: React.ReactNode;
	errorText?: string;
}

const ToolOutput = React.forwardRef<HTMLDivElement, ToolOutputProps>(
	({ className, output, errorText, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("p-3 bg-muted rounded-md", className)}
			{...props}
		>
			<div className="text-sm font-medium mb-1">Output:</div>
			{errorText ? (
				<div className="text-red-500 text-sm">{errorText}</div>
			) : (
				<div className="text-sm">{output}</div>
			)}
		</div>
	),
);
ToolOutput.displayName = "ToolOutput";

export { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput };

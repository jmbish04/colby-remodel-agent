import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    ChevronRight,
    Circle
} from "lucide-react";
import * as React from "react";

interface TaskProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultOpen?: boolean;
	children: React.ReactNode;
}

const Task = React.forwardRef<HTMLDivElement, TaskProps>(
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
Task.displayName = "Task";

interface TaskTriggerProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	title: string;
}

const TaskTrigger = React.forwardRef<HTMLButtonElement, TaskTriggerProps>(
	({ className, title, ...props }, ref) => (
		<CollapsibleTrigger asChild>
			<Button
				ref={ref}
				variant="ghost"
				className={cn("w-full justify-start p-0 h-auto font-normal", className)}
				{...props}
			>
				<div className="flex items-center gap-2 w-full">
					<ChevronRight className="h-4 w-4" />
					<span className="font-medium">{title}</span>
				</div>
			</Button>
		</CollapsibleTrigger>
	),
);
TaskTrigger.displayName = "TaskTrigger";

const TaskContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<CollapsibleContent>
		<div ref={ref} className={cn("pt-2 space-y-2", className)} {...props} />
	</CollapsibleContent>
));
TaskContent.displayName = "TaskContent";

const TaskItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-start gap-2 text-sm", className)}
		{...props}
	>
		<Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
		{props.children}
	</div>
));
TaskItem.displayName = "TaskItem";

interface TaskItemFileProps extends React.HTMLAttributes<HTMLSpanElement> {
	children: React.ReactNode;
}

const TaskItemFile = React.forwardRef<HTMLSpanElement, TaskItemFileProps>(
	({ className, ...props }, ref) => (
		<span
			ref={ref}
			className={cn(
				"inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-mono",
				className,
			)}
			{...props}
		/>
	),
);
TaskItemFile.displayName = "TaskItemFile";

export { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger };

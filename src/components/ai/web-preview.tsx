import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, RefreshCw } from "lucide-react";
import * as React from "react";

interface WebPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultUrl?: string;
	children: React.ReactNode;
}

const WebPreview = React.forwardRef<HTMLDivElement, WebPreviewProps>(
	({ className, defaultUrl, children, ...props }, ref) => {
		const [currentUrl, setCurrentUrl] = React.useState(defaultUrl || "");

		return (
			<div
				ref={ref}
				className={cn(
					"border rounded-lg overflow-hidden bg-background",
					className,
				)}
				{...props}
			>
				{React.Children.map(children, (child) =>
					React.isValidElement(child)
						? React.cloneElement(child, { currentUrl, setCurrentUrl })
						: child,
				)}
			</div>
		);
	},
);
WebPreview.displayName = "WebPreview";

interface WebPreviewNavigationProps
	extends React.HTMLAttributes<HTMLDivElement> {
	currentUrl?: string;
	setCurrentUrl?: (url: string) => void;
	children: React.ReactNode;
}

const WebPreviewNavigation = React.forwardRef<
	HTMLDivElement,
	WebPreviewNavigationProps
>(({ className, currentUrl, setCurrentUrl, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex items-center gap-2 p-3 border-b bg-muted/50",
			className,
		)}
		{...props}
	>
		<Button variant="ghost" size="icon" className="h-8 w-8">
			<RefreshCw className="h-4 w-4" />
		</Button>
		{React.Children.map(children, (child) =>
			React.isValidElement(child)
				? React.cloneElement(child, { currentUrl, setCurrentUrl })
				: child,
		)}
		<Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
			<ExternalLink className="h-4 w-4" />
		</Button>
	</div>
));
WebPreviewNavigation.displayName = "WebPreviewNavigation";

interface WebPreviewUrlProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	currentUrl?: string;
	setCurrentUrl?: (url: string) => void;
}

const WebPreviewUrl = React.forwardRef<HTMLInputElement, WebPreviewUrlProps>(
	({ className, currentUrl, setCurrentUrl, ...props }, ref) => (
		<input
			ref={ref}
			type="text"
			value={currentUrl}
			onChange={(e) => setCurrentUrl?.(e.target.value)}
			className={cn(
				"flex-1 px-3 py-1 text-sm border rounded bg-background",
				className,
			)}
			placeholder="https://example.com"
			{...props}
		/>
	),
);
WebPreviewUrl.displayName = "WebPreviewUrl";

const WebPreviewBody = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("flex-1 p-4 bg-white", className)} {...props}>
		<iframe
			src="about:blank"
			className="w-full h-full border-0"
			title="UI Preview"
		/>
	</div>
));
WebPreviewBody.displayName = "WebPreviewBody";

export { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl };

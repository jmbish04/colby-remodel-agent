"use client";

import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai/prompt-input";
import {
    WebPreview,
    WebPreviewBody,
    WebPreviewNavigation,
    WebPreviewUrl,
} from "@/components/ai/web-preview";
import { useState } from "react";

export default function UIGenerator() {
	const [previewUrl, setPreviewUrl] = useState("");
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim()) return;

		setIsGenerating(true);
		try {
			const response = await fetch("/api/generate-ui", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});

			const data = await response.json();
			setPreviewUrl(data.url);
			setPrompt("");
		} catch (error) {
			console.error("Generation failed:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="flex flex-col h-full max-w-6xl mx-auto p-6">
			<div className="flex-1 mb-4">
				{isGenerating ? (
					<div className="flex flex-col items-center justify-center h-full">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">Generating your UI...</p>
						</div>
					</div>
				) : previewUrl ? (
					<WebPreview defaultUrl={previewUrl} className="h-full">
						<WebPreviewNavigation>
							<WebPreviewUrl />
						</WebPreviewNavigation>
						<WebPreviewBody />
					</WebPreview>
				) : (
					<div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
						<p className="text-muted-foreground">
							Your generated UI will appear here
						</p>
					</div>
				)}
			</div>

			<PromptInput onSubmit={handleSubmit}>
				<PromptInputTextarea
					value={prompt}
					onChange={(e) => setPrompt(e.currentTarget.value)}
					placeholder="Describe the UI you want to create..."
					disabled={isGenerating}
				/>
				<PromptInputSubmit
					status={isGenerating ? "loading" : "idle"}
					disabled={!prompt.trim() || isGenerating}
				/>
			</PromptInput>
		</div>
	);
}

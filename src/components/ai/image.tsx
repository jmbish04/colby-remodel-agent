"use client";

import { useState } from "react";
// import { Loader } from "@/components/ai/loader";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai/prompt-input";

export default function ImageGenerator() {
	const [prompt, setPrompt] = useState("");
	const [imageData, setImageData] = useState<{
		src: string;
		alt?: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim()) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/image", {
				method: "POST",
				body: JSON.stringify({ prompt }),
			});

			const data = await response.json();
			setImageData(data);
		} catch (error) {
			console.error("Error generating image:", error);
		} finally {
			setIsLoading(false);
		}
		setPrompt("");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto p-4">
				{imageData && (
					<div className="flex justify-center">
						<img
							{...imageData}
							alt={imageData?.alt || "AI generated content"}
							className="max-w-md rounded-lg border"
						/>
					</div>
				)}
				{isLoading && <div className="text-center">Generating image...</div>}
			</div>

			<PromptInput onSubmit={handleSubmit} className="mt-4">
				<PromptInputTextarea
					value={prompt}
					placeholder="Describe the image..."
					onChange={(e) => setPrompt(e.currentTarget.value)}
				/>
				<PromptInputSubmit
					status={isLoading ? "loading" : "idle"}
					disabled={!prompt.trim()}
				/>
			</PromptInput>
		</div>
	);
}

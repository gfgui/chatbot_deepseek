import { NextResponse } from "next/server";
import OpenAI from "openai";

if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek key is not found");
}

const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure messages exist and are properly typed
        if (!body.messages || !Array.isArray(body.messages)) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a friendly AI assistant." },
                ...body.messages,
            ],
        });

        const responseMessage = completion.choices?.[0]?.message?.content;
        if (!responseMessage) {
            throw new Error("No response content received");
        }

        return NextResponse.json({ message: responseMessage });
    } catch (err: unknown) {
        // Ensure proper error handling with TypeScript
        const errorMessage = err instanceof Error ? err.message : "Internal server error";
        console.error("API Error:", errorMessage);

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

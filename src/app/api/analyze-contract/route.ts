import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory store for rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

export async function POST(req: Request) {
  try {
    // Check if enough time has passed since the last request
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }
    lastRequestTime = now;

    const { contractText } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing contracts for potential fraud or scams. Evaluate the following contract text and provide a brief analysis of its legitimacy, highlighting any red flags or suspicious elements."
        },
        {
          role: "user",
          content: contractText
        }
      ],
      max_tokens: 300,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing contract:', error);
    if (error instanceof Error && 'code' in error && error.code === 'insufficient_quota') {
      return NextResponse.json({ error: 'API quota exceeded. Please check your OpenAI plan and billing details.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Error analyzing contract' }, { status: 500 });
  }
}

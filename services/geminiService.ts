import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { TrendItem, Source, NewsCategory, Region } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches trending news based on a category and region using Gemini with Google Search Grounding.
 */
export const fetchTrendingNews = async (category: NewsCategory, region: Region = Region.USA): Promise<TrendItem[]> => {
  try {
    const prompt = `
      Act as an advanced trend algorithm. Find the top 15 most viral and important news stories right now for the category "${category}" specifically in the "${region}" region.
      
      CRITICAL SOURCE INSTRUCTION:
      You MUST analyze real-time trends from social platforms like X (formerly Twitter), Threads, and Reddit, alongside traditional news outlets. Look for high-engagement topics.

      For each story, provide:
      1. A catchy, short headline.
      2. A concise summary (max 2 sentences).
      3. A list of 3-5 trending hashtags currently being used for this topic.
      4. An estimated 'virality score' from 1-100 based on social media momentum.

      Format the output strictly as a list where each item starts with "### ITEM".
      Inside each item, use lines starting with:
      Headline: [Value]
      Summary: [Value]
      Hashtags: [Value]
      Score: [Value]

      Ensure you return exactly 15 items.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT allowed with googleSearch
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources from grounding chunks
    const allSources: Source[] = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    // Parse the text response into structured data
    const items: TrendItem[] = [];
    const rawItems = text.split("### ITEM").slice(1); // Skip preamble

    rawItems.forEach((raw, index) => {
      const headlineMatch = raw.match(/Headline:\s*(.*)/);
      const summaryMatch = raw.match(/Summary:\s*(.*)/);
      const hashtagsMatch = raw.match(/Hashtags:\s*(.*)/);
      const scoreMatch = raw.match(/Score:\s*(\d+)/);

      if (headlineMatch) {
        // Distribute sources somewhat randomly across items since Search Grounding returns a global list
        const sourceStartIndex = index % Math.max(1, allSources.length - 2);
        const itemSources = allSources.slice(sourceStartIndex, sourceStartIndex + 2);

        items.push({
          id: `trend-${Date.now()}-${index}`,
          category,
          headline: headlineMatch[1].trim(),
          summary: summaryMatch ? summaryMatch[1].trim() : "No summary available.",
          hashtags: hashtagsMatch ? hashtagsMatch[1].split(',').map(tag => tag.trim()) : [],
          viralityScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 50,
          sources: itemSources, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    return items;

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Generates social media content for a specific trend.
 */
export const generateSocialPost = async (trend: TrendItem, platform: 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube'): Promise<string> => {
  try {
    let specificPrompt = "";

    switch (platform) {
      case 'YouTube':
        specificPrompt = `
          Create a full Video Script for a YouTube video.
          CRITICAL REQUIREMENT: The script must be approximately 3 minutes long when spoken at a normal pace (approx. 450-500 words).
          
          Structure:
          - [0:00-0:30] Hook & Intro: Grab attention immediately.
          - [0:30-2:30] Main Body: Deep dive into the details, context, and implications. Break into 3 clear points.
          - [2:30-3:00] Outro & CTA: Summary and ask to subscribe.
          
          Include Visual Cues in brackets like [Visual: Show graph of...] but focus on the spoken narration.
        `;
        break;
      case 'TikTok':
        specificPrompt = `
          Create a viral TikTok script. 
          Style: Fast-paced, high energy, visual. 
          Duration: Under 60 seconds.
          Structure: 
          - Visual Hook (Text overlay suggestions)
          - The "What Happened" (Fast narration)
          - The "Why it Matters" 
          - CTA (e.g., "Follow for more")
        `;
        break;
      case 'Twitter':
        specificPrompt = `Create a thread of 3-5 tweets or a long-form post. Tone: Punchy, informative, uses line breaks.`;
        break;
      case 'LinkedIn':
        specificPrompt = `Create a professional thought-leadership post. Tone: Analytical, business-focused.`;
        break;
      case 'Instagram':
        specificPrompt = `Create a caption with a hook. Tone: Visual, lifestyle-oriented, engaging.`;
        break;
    }

    const prompt = `
      Act as a world-class social media manager.
      ${specificPrompt}
      
      News Story:
      Headline: ${trend.headline}
      Summary: ${trend.summary}
      Context: ${trend.category}

      Hashtags to use: ${trend.hashtags.join(', ')}

      Return ONLY the content text/script.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Failed to generate content.";

  } catch (error) {
    console.error("Error generating post:", error);
    return "Error generating content. Please try again.";
  }
};

/**
 * Generates audio speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    // Truncate text if it's too long for a single TTS pass, or just take the first chunk for preview
    // For this demo, we'll try to process the text. Clean up visual cues [brackets] for better audio.
    const cleanText = text.replace(/\[.*?\]/g, '').trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore, Puck, Charon, Fenrir, Zephyr
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};
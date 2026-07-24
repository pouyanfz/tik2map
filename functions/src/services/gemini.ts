import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedPlace } from "../types";

// "gemini-2.5-flash-lite" is blocked for newly-created API keys as of 2026
// ("no longer available to new users"). Use the rolling flash-lite alias so
// this doesn't need to be manually bumped each time Google deprecates a
// pinned version.
const MODEL = "gemini-flash-lite-latest";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    found: { type: Type.BOOLEAN },
    placeName: { type: Type.STRING },
    address: { type: Type.STRING },
  },
  required: ["found"],
};

const PROMPT = `You are given a TikTok video caption. Determine whether it mentions a
specific restaurant, cafe, bar, or other named venue (as opposed to just a dish, city,
or generic activity).

If it does, extract:
- placeName: the name of the venue as mentioned (best guess at the real business name)
- address: any address/neighborhood/city detail mentioned in the caption, or an empty
  string if none is given

If no specific venue is mentioned, set "found" to false and omit placeName/address.

Caption:
"""
{{caption}}
"""`;

/**
 * Sends a TikTok caption to Gemini and asks it to extract a place name/address,
 * or determine that none is mentioned.
 */
export async function extractPlaceFromCaption(
  caption: string,
  apiKey: string
): Promise<ExtractedPlace | null> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: PROMPT.replace("{{caption}}", caption),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(text) as {
    found: boolean;
    placeName?: string;
    address?: string;
  };

  if (!parsed.found || !parsed.placeName) {
    return null;
  }

  return {
    placeName: parsed.placeName,
    address: parsed.address?.trim() || null,
  };
}

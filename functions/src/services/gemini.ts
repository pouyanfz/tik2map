import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedPlace } from "../types";

// "gemini-2.5-flash-lite" is blocked for newly-created API keys as of 2026
// ("no longer available to new users"). Use the rolling flash-lite alias so
// this doesn't need to be manually bumped each time Google deprecates a
// pinned version.
const MODEL = "gemini-flash-lite-latest";
const REQUEST_TIMEOUT_MS = 15_000;

// found/placeName/address are all marked required (with placeName/address set
// to "" when not applicable) rather than just "found" - with only "found"
// required, this small model frequently stopped generating right after it
// (or mid-way through placeName) instead of emitting the other fields,
// silently dropping the address about half the time even when the caption
// had one. Forcing the model to always produce a fixed 3-field shape fixed
// the flakiness in testing (see functions/scripts/test-*.ts).
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    found: { type: Type.BOOLEAN },
    placeName: { type: Type.STRING },
    address: { type: Type.STRING },
  },
  required: ["found", "placeName", "address"],
  propertyOrdering: ["found", "placeName", "address"],
};

const PROMPT = `You are given a TikTok video caption. Determine whether it mentions a
specific restaurant, cafe, bar, or other named venue (as opposed to just a dish, city,
or generic activity).

Always respond with all three fields:
- found: true if a venue is mentioned, false otherwise
- placeName: the name of the venue as mentioned (best guess at the real business name),
  or an empty string if none is found
- address: any address/neighborhood/city detail mentioned in the caption, or an empty
  string if none is given

Captions often flag the venue with a 📍 emoji, frequently followed by the address
in parentheses right after the name, e.g. "📍 Baohaus (6271 Kingsway, Burnaby, BC
V5J 0H4)" or "📍Marutama Ramen - 780 Bidwell St, Vancouver, BC". Treat text in
parentheses or after a dash immediately following a 📍-marked name as the address,
even though it's not a full sentence - extract it into the address field rather
than leaving it empty or merging it into placeName.

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

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: PROMPT.replace("{{caption}}", caption),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        httpOptions: { timeout: REQUEST_TIMEOUT_MS },
      },
    });
  } catch (err) {
    throw new Error(`Gemini request failed: ${(err as Error).message}`);
  }

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

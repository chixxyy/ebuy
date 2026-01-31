import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
// Source file containing the original text (ZH)
const SOURCE_FILE = path.join(__dirname, "../src/manual-dictionary.json");
// Target file to save/update (EN)
const TARGET_FILE = path.join(__dirname, "../src/locales/en.json");
const MODEL_NAME = "llama3"; // Updated to installed model
const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const CHUNK_SIZE = 10; // Batch size

/**
 * Helper: Flatten Object to dotted keys
 */
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

/**
 * Helper: Unflatten Object
 */
function unflattenObject(data) {
  const result = {};
  for (const i in data) {
    const keys = i.split(".");
    keys.reduce((r, e, j) => {
      return r[e] || (r[e] = keys.length - 1 === j ? data[i] : {});
    }, result);
  }
  return result;
}

/**
 * Check which keys need translation
 */
function getMissingKeys(sourceFlat, targetFlat) {
  const missing = {};
  for (const key in sourceFlat) {
    // We only translate strings
    if (typeof sourceFlat[key] !== "string") continue;

    // If key missing in target, or target value is empty/null
    if (!targetFlat[key]) {
      missing[key] = sourceFlat[key];
    }
  }
  return missing;
}

/**
 * Call Ollama API
 */
async function translateWrapper(chunkObj, retryCount = 0) {
  const prompt = `
    You are a professional frontend engineer and translator.
    Translate the following JSON object values from Traditional Chinese to English.
    
    Rules:
    1. Keep all keys EXACTLY the same.
    2. Only translate the values.
    3. Maintain any placeholder variables like {name}, {count}.
    4. Direct translation only, no explanations.
    
    Source JSON:
    ${JSON.stringify(chunkObj)}
    `;

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    console.error("❌ API Call failed:", error.message);
    if (retryCount < 3) {
      console.log("🔄 Retrying...");
      return translateWrapper(chunkObj, retryCount + 1);
    }
    throw error;
  }
}

async function main() {
  console.log(`🚀 Starting Ollama Translation (${MODEL_NAME})...`);

  // 1. Read Source
  let sourceData = {};
  try {
    const raw = await fs.readFile(SOURCE_FILE, "utf-8");
    sourceData = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Error reading source file: ${SOURCE_FILE}`);
    process.exit(1);
  }

  // In manual-dictionary, content might be nested under `dictionary['zh-TW']`
  // Let's look for that if we are using manual-dictionary.json
  let effectiveSource = sourceData;
  if (sourceData.dictionary && sourceData.dictionary["zh-TW"]) {
    effectiveSource = sourceData.dictionary["zh-TW"];
    console.log(
      "ℹ️ Detected manual-dictionary structure, using 'zh-TW' subtree.",
    );
  }

  // 2. Read Target (for resume)
  let targetData = {};
  try {
    const raw = await fs.readFile(TARGET_FILE, "utf-8");
    targetData = JSON.parse(raw);
    // Also verify if target is nested structure
    if (targetData.dictionary && targetData.dictionary.en) {
      console.log(
        "ℹ️ Detected output file has dictionary structure, merging into 'en' subtree.",
      );
      // We will update this subtree but save the whole file structure later?
      // Actually, for simplicity, let's just assume we are managing the 'en' object.
      // But if we want to save valid file, we need to be careful.
      // For now, let's treat targetData as the locale object itself if simpler.
      // But user wants to update `src/locales/en.json`.
      // If that file is intlayer format, it's complex.
      // Let's assume standard k-v structure for `locales/en.json`.
      // If targetData has `dictionary.en`, let's isolate it.
    }
  } catch (e) {
    console.log("ℹ️ No existing target file found, starting fresh.");
  }

  // 3. Flatten
  const sourceFlat = flattenObject(effectiveSource);
  const targetFlat = flattenObject(targetData);

  // 4. Find Missing
  const missingMap = getMissingKeys(sourceFlat, targetFlat);
  const missingKeys = Object.keys(missingMap);

  if (missingKeys.length === 0) {
    console.log("✅ All keys are already translated!");
    return;
  }

  console.log(`📦 Found ${missingKeys.length} keys to translate.`);

  // 5. Chunking & processing
  let processedCount = 0;
  const pendingUpdates = { ...targetFlat }; // Start with existing

  const chunks = [];
  for (let i = 0; i < missingKeys.length; i += CHUNK_SIZE) {
    const chunkKeys = missingKeys.slice(i, i + CHUNK_SIZE);
    const chunkObj = {};
    chunkKeys.forEach((k) => (chunkObj[k] = missingMap[k]));
    chunks.push(chunkObj);
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(
      `🤖 Translating batch ${i + 1}/${chunks.length} (${Object.keys(chunk).length} keys)...`,
    );

    try {
      const result = await translateWrapper(chunk);
      // Merge results
      Object.assign(pendingUpdates, result);

      // Save Progress periodically (optional, or just at end)
      // Let's save every batch to be safe
      processedCount += Object.keys(chunk).length;
    } catch (e) {
      console.error(`❌ Batch ${i + 1} failed. Skipping.`);
    }
  }

  // 6. Save
  const finalJSON = unflattenObject(pendingUpdates);

  // If we originally had a wrapper structure, we might want to preserve it?
  // The prompt implied `src/locales/en.json` which usually is just the locale object.
  // I will simply save the locale object.

  await fs.mkdir(path.dirname(TARGET_FILE), { recursive: true });
  await fs.writeFile(TARGET_FILE, JSON.stringify(finalJSON, null, 2));

  console.log(
    `✅ Translation complete! ${processedCount}/${missingKeys.length} keys translated.`,
  );
  console.log(`💾 Saved to: ${TARGET_FILE}`);
}

main();

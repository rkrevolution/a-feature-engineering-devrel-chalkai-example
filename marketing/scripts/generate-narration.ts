import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const scenes = [
  {
    id: "scene0_intro",
    text: `[friendly] This is a DevRel case study. I took a technical take-home project, built a real solution, and turned it into a full content package: code, blog post, and this video.`,
  },
  {
    id: "scene1_hook",
    text: `The project: a company sells fishing gear to national parks. Their California rep needs to visit twenty-eight parks. How many driving hours will they spend on the road? I was given a starter project with one model and one resolver. I extended it into a full travel forecasting pipeline.`,
  },
  {
    id: "scene2_tool",
    text: `The platform is Chalk, a feature engineering tool for ML and real-time data. You define features in Python, write resolver functions that compute them, and Chalk wires everything together. One resolver's output feeds the next automatically.`,
  },
  {
    id: "scene3_data",
    text: `The starter project only had park names and descriptions. I added three new fields: activities, GPS coordinates, and a fishing flag. Then I built boolean filters to narrow 28 parks down to the ones that actually have fishing.`,
  },
  {
    id: "scene4_math",
    text: `How far apart are these parks? I used the Haver-sine formula for great-circle distance from GPS coordinates. For twenty-eight parks that's three hundred seventy-eight unique pairs. Compute each distance, divide by fifty miles per hour, and you've got drive time for every combination.`,
  },
  {
    id: "scene5_route",
    text: `Now the key question: what's the total drive time? I used a nearest-neighbor algorithm. Start at one park, always go to the closest unvisited one. From Yosemite, thirty-six driving hours. From Alcatraz, thirty-nine. [authoritatively] That three hour difference is real money when you're planning territory comp and mileage.`,
  },
  {
    id: "scene6_query",
    text: `[authoritatively] And all of that, the filtering, the distances, the route optimization, comes down to a single Chalk query. Thirty-six driving hours from Yosemite.`,
  },
  {
    id: "scene7_close",
    text: `One take-home project became four deliverables: working code deployed on Chalk, a technical blog post, this video built with Remotion and AI narration, and a distribution plan. Build it, write it, ship it.`,
  },
];

async function generateNarration() {
  const outDir = path.join(__dirname, "..", "public", "narration");
  fs.mkdirSync(outDir, { recursive: true });

  for (const scene of scenes) {
    console.log(`Generating ${scene.id}...`);
    const response = await groq.audio.speech.create({
      model: "canopylabs/orpheus-v1-english",
      voice: "troy",
      input: scene.text,
      response_format: "wav",
    });

    const filePath = path.join(outDir, `${scene.id}.wav`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`  -> ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  }

  console.log("\nDone! All narration files in public/narration/");
}

generateNarration().catch(console.error);

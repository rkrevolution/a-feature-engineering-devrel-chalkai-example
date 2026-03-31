// Narration text for Groq TTS generation.
// Audience: developers and recruiters evaluating this as a DevRel case study.
// NOT Chalk-specific -- this is a portfolio piece showing the full build-write-ship workflow.

export const NARRATION = {
  scene0: `This is a DevRel case study. I took a technical take-home project, built a real solution, and turned it into a full content package: code, blog post, and this video.`,

  scene1: `The project: a company sells fishing gear to national parks. Their California rep needs to visit 28 parks. How many hours will they be on the road? I was given a starter project with one model and one resolver. I extended it into a full travel forecasting pipeline.`,

  scene2: `The platform is Chalk -- a feature engineering tool for ML and real-time data. You define features in Python, write resolver functions that compute them, and Chalk wires everything together. One resolver's output feeds the next automatically.`,

  scene3: `The starter project only had park names and descriptions. I added three new fields: activities, GPS coordinates, and a fishing flag. Then I built boolean filters to narrow 28 parks down to the ones that actually have fishing.`,

  scene4: `How far apart are these parks? I used the Haversine formula for great-circle distance from GPS coordinates. For 28 parks that's 378 unique pairs. Compute each distance, divide by 50 miles per hour, and you've got drive time for every combination.`,

  scene5: `Now the key question: what's the total drive time? I used a nearest-neighbor algorithm -- start at one park, always go to the closest unvisited one. From Yosemite: 36 hours. From Alcatraz: 39. That 3-hour difference is real money when you're planning territory comp and mileage.`,

  scene6: `And all of that -- the filtering, the distances, the route optimization -- is one Chalk query. 36 hours from Yosemite.`,

  scene7: `One take-home project became four deliverables: working code deployed on Chalk, a technical blog post, this video built with Remotion and AI narration, and a distribution plan. Build it, write it, ship it.`,
};

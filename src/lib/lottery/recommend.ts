import { RecommendedSet, RecommendMethod, NumberFrequency } from "@/types/lottery";

function getRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function weightedRandom(weights: { number: number; weight: number }[], count: number): number[] {
  const selected = new Set<number>();
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  while (selected.size < count) {
    let rand = Math.random() * totalWeight;
    for (const w of weights) {
      rand -= w.weight;
      if (rand <= 0) {
        selected.add(w.number);
        break;
      }
    }
  }
  return Array.from(selected).sort((a, b) => a - b);
}

function generateBalanced(): number[] {
  const sections = [
    [1, 9],
    [10, 18],
    [19, 27],
    [28, 36],
    [37, 45],
  ];

  const numbers = new Set<number>();

  // Pick one from each of 5 sections, then 1 random
  for (const [min, max] of sections) {
    if (numbers.size >= 5) break;
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  // Ensure roughly balanced odd/even
  const arr = Array.from(numbers);
  const oddCount = arr.filter((n) => n % 2 === 1).length;
  if (oddCount < 2 || oddCount > 4) {
    return generateBalanced(); // retry
  }

  return arr.sort((a, b) => a - b);
}

export function generateRecommendation(
  method: RecommendMethod,
  frequencies: NumberFrequency[],
  recentFrequencies: NumberFrequency[],
  setCount: number = 5
): RecommendedSet[] {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const sets: RecommendedSet[] = [];

  for (let i = 0; i < setCount; i++) {
    let numbers: number[];

    switch (method) {
      case "random":
        numbers = getRandomNumbers(6, 1, 45);
        break;

      case "statistics": {
        const weights = frequencies.map((f) => ({
          number: f.number,
          weight: f.count + 1,
        }));
        numbers = weightedRandom(weights, 6);
        break;
      }

      case "hot": {
        const weights = recentFrequencies.map((f) => ({
          number: f.number,
          weight: (f.count + 1) * 3,
        }));
        numbers = weightedRandom(weights, 6);
        break;
      }

      case "cold": {
        const maxCount = Math.max(...recentFrequencies.map((f) => f.count));
        const weights = recentFrequencies.map((f) => ({
          number: f.number,
          weight: maxCount - f.count + 1,
        }));
        numbers = weightedRandom(weights, 6);
        break;
      }

      case "balanced":
        numbers = generateBalanced();
        break;

      case "ai": {
        // Composite: blend all strategies
        const weights = frequencies.map((f) => {
          const recent = recentFrequencies.find((r) => r.number === f.number);
          const recentCount = recent?.count ?? 0;
          const maxRecent = Math.max(...recentFrequencies.map((r) => r.count));
          const coldBonus = maxRecent - recentCount;

          return {
            number: f.number,
            weight:
              f.count * 0.2 +
              recentCount * 3 * 0.25 +
              coldBonus * 0.15 +
              Math.random() * 10 * 0.3,
          };
        });
        numbers = weightedRandom(weights, 6);

        // Apply balance filter
        const oddCount = numbers.filter((n) => n % 2 === 1).length;
        if (oddCount < 1 || oddCount > 5) {
          numbers = generateBalanced();
        }
        break;
      }

      default:
        numbers = getRandomNumbers(6, 1, 45);
    }

    sets.push({
      label: `${labels[i]}조`,
      numbers,
    });
  }

  return sets;
}

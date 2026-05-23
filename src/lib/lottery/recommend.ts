import { RecommendedSet, RecommendMethod, NumberFrequency } from "@/types/lottery";
import { LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER, LOTTO_NUMBERS_PER_SET, LOTTO_SECTIONS } from "@/lib/constants";

/** Weighting factors for recommendation algorithms. */
const HOT_NUMBER_MULTIPLIER = 3;
const AI_WEIGHT_ALL_TIME = 0.2;
const AI_WEIGHT_HOT = 0.25;
const AI_WEIGHT_COLD = 0.15;
const AI_WEIGHT_RANDOM = 0.3;
const AI_RANDOM_SCALE = 10;

function getRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function weightedRandom(weights: { number: number; weight: number }[], count: number): number[] {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  if (weights.length < count || totalWeight === 0) {
    return getRandomNumbers(count, LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER);
  }

  const selected = new Set<number>();
  while (selected.size < count) {
    const eligible = weights.filter((w) => !selected.has(w.number));
    const eligibleTotal = eligible.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * eligibleTotal;
    for (let k = 0; k < eligible.length; k++) {
      rand -= eligible[k].weight;
      if (rand <= 0 || k === eligible.length - 1) {
        selected.add(eligible[k].number);
        break;
      }
    }
  }
  return Array.from(selected).sort((a, b) => a - b);
}

function generateBalanced(): number[] {

  const numbers = new Set<number>();

  // Pick one from each of 5 sections, then 1 random
  for (const [min, max] of LOTTO_SECTIONS) {
    if (numbers.size >= 5) break;
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  while (numbers.size < LOTTO_NUMBERS_PER_SET) {
    numbers.add(Math.floor(Math.random() * LOTTO_MAX_NUMBER) + LOTTO_MIN_NUMBER);
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
        numbers = getRandomNumbers(LOTTO_NUMBERS_PER_SET, LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER);
        break;

      case "statistics": {
        const weights = frequencies.map((f) => ({
          number: f.number,
          weight: f.count + 1,
        }));
        numbers = weightedRandom(weights, LOTTO_NUMBERS_PER_SET);
        break;
      }

      case "hot": {
        const weights = recentFrequencies.map((f) => ({
          number: f.number,
          weight: (f.count + 1) * HOT_NUMBER_MULTIPLIER,
        }));
        numbers = weightedRandom(weights, LOTTO_NUMBERS_PER_SET);
        break;
      }

      case "cold": {
        const maxCount = recentFrequencies.length > 0
          ? Math.max(...recentFrequencies.map((f) => f.count))
          : 0;
        const weights = recentFrequencies.map((f) => ({
          number: f.number,
          weight: maxCount - f.count + 1,
        }));
        numbers = weightedRandom(weights, LOTTO_NUMBERS_PER_SET);
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
          const maxRecent = recentFrequencies.length > 0
            ? Math.max(...recentFrequencies.map((r) => r.count))
            : 0;
          const coldBonus = maxRecent - recentCount;

          return {
            number: f.number,
            weight:
              f.count * AI_WEIGHT_ALL_TIME +
              recentCount * HOT_NUMBER_MULTIPLIER * AI_WEIGHT_HOT +
              coldBonus * AI_WEIGHT_COLD +
              Math.random() * AI_RANDOM_SCALE * AI_WEIGHT_RANDOM,
          };
        });
        numbers = weightedRandom(weights, LOTTO_NUMBERS_PER_SET);

        // Apply balance filter
        const oddCount = numbers.filter((n) => n % 2 === 1).length;
        if (oddCount < 1 || oddCount > 5) {
          numbers = generateBalanced();
        }
        break;
      }

      default:
        numbers = getRandomNumbers(LOTTO_NUMBERS_PER_SET, LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER);
    }

    sets.push({
      label: `${labels[i]}조`,
      numbers,
    });
  }

  return sets;
}

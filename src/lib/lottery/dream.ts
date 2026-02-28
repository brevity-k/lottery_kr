import type { DreamCategory } from "@/types/lottery";
import { LOTTO_NUMBERS_PER_SET } from "@/lib/constants";

export const DREAM_CATEGORIES: DreamCategory[] = [
  {
    id: "animal",
    emoji: "🐷",
    name: "동물",
    description: "동물이 나오는 꿈",
    keywords: [
      { id: "pig", emoji: "🐷", name: "돼지", interpretation: "재물과 복을 상징합니다. 돼지꿈은 대표적인 길몽으로, 금전운이 상승합니다.", numbers: [3, 8, 12, 18, 23, 28, 33, 38, 43] },
      { id: "dragon", emoji: "🐉", name: "용", interpretation: "최고의 길몽입니다. 큰 행운과 성공, 출세를 의미합니다.", numbers: [1, 7, 14, 21, 27, 34, 39, 44, 45] },
      { id: "snake", emoji: "🐍", name: "뱀", interpretation: "재물운을 상징합니다. 뱀이 집에 들어오면 돈이 들어옵니다.", numbers: [4, 9, 13, 19, 24, 29, 36, 41, 44] },
      { id: "horse", emoji: "🐴", name: "말", interpretation: "활력과 전진을 상징합니다. 승진이나 합격을 암시합니다.", numbers: [2, 7, 15, 20, 26, 31, 37, 42, 45] },
      { id: "cow", emoji: "🐄", name: "소", interpretation: "근면과 풍요를 상징합니다. 꾸준한 노력이 결실을 맺습니다.", numbers: [5, 10, 16, 22, 25, 30, 35, 40, 43] },
      { id: "fish", emoji: "🐟", name: "물고기", interpretation: "행운과 풍요를 의미합니다. 잉어꿈은 특히 좋은 징조입니다.", numbers: [3, 11, 17, 22, 28, 33, 38, 41, 44] },
      { id: "tiger", emoji: "🐯", name: "호랑이", interpretation: "권위와 용맹을 상징합니다. 큰 기회가 찾아옵니다.", numbers: [1, 6, 14, 19, 27, 32, 37, 42, 45] },
    ],
  },
  {
    id: "nature",
    emoji: "🌊",
    name: "자연",
    description: "자연 현상이 나오는 꿈",
    keywords: [
      { id: "water", emoji: "💧", name: "물/홍수", interpretation: "감정과 재물을 상징합니다. 맑은 물은 행운, 큰 물은 큰 재물을 의미합니다.", numbers: [2, 8, 15, 21, 26, 32, 36, 40, 44] },
      { id: "fire", emoji: "🔥", name: "불", interpretation: "열정과 변화를 상징합니다. 집에 불이 나는 꿈은 역설적으로 길몽입니다.", numbers: [4, 9, 14, 20, 27, 31, 37, 41, 45] },
      { id: "mountain", emoji: "⛰️", name: "산", interpretation: "높은 목표 달성과 안정을 상징합니다. 산 정상에 오르면 좋은 징조입니다.", numbers: [1, 7, 13, 18, 25, 30, 35, 39, 43] },
      { id: "flower", emoji: "🌸", name: "꽃", interpretation: "행복과 아름다움을 상징합니다. 꽃이 활짝 피면 기쁜 소식이 옵니다.", numbers: [3, 10, 16, 22, 28, 33, 38, 42, 44] },
      { id: "rain", emoji: "🌧️", name: "비", interpretation: "정화와 새로운 시작을 의미합니다. 비 온 뒤 맑으면 좋은 전환점입니다.", numbers: [5, 11, 17, 23, 29, 34, 39, 41, 43] },
      { id: "sun", emoji: "☀️", name: "해/달", interpretation: "밝은 미래와 큰 성공을 의미합니다. 해와 달이 함께 뜨면 최고의 길몽입니다.", numbers: [1, 6, 12, 19, 24, 30, 36, 40, 45] },
    ],
  },
  {
    id: "object",
    emoji: "💎",
    name: "물건/보물",
    description: "물건이나 보물이 나오는 꿈",
    keywords: [
      { id: "gold", emoji: "🥇", name: "금/보석", interpretation: "큰 재물과 부를 상징합니다. 금을 얻는 꿈은 횡재를 암시합니다.", numbers: [1, 7, 14, 21, 28, 33, 39, 43, 45] },
      { id: "money", emoji: "💵", name: "돈", interpretation: "금전운 상승을 의미합니다. 돈을 받는 꿈은 실제 수입 증가를 암시합니다.", numbers: [3, 8, 15, 22, 27, 34, 38, 42, 44] },
      { id: "ring", emoji: "💍", name: "반지", interpretation: "인연과 약속을 상징합니다. 귀중한 인연이나 기회를 만납니다.", numbers: [2, 9, 16, 23, 29, 35, 37, 41, 43] },
      { id: "clothes", emoji: "👔", name: "옷", interpretation: "새로운 옷은 새로운 시작과 변화를 의미합니다.", numbers: [4, 10, 17, 24, 30, 36, 38, 40, 44] },
      { id: "key", emoji: "🔑", name: "열쇠", interpretation: "문제 해결과 새로운 기회를 상징합니다. 문을 여는 꿈은 길이 열립니다.", numbers: [5, 11, 18, 25, 31, 37, 39, 42, 45] },
      { id: "mirror", emoji: "🪞", name: "거울", interpretation: "자기 성찰과 진실을 상징합니다. 거울에 비친 모습이 좋으면 길몽입니다.", numbers: [6, 12, 19, 26, 32, 34, 40, 43, 44] },
    ],
  },
  {
    id: "person",
    emoji: "👤",
    name: "사람",
    description: "사람이 나오는 꿈",
    keywords: [
      { id: "deceased", emoji: "👻", name: "돌아가신 분", interpretation: "조상의 보호와 도움을 의미합니다. 조상이 무언가를 주면 큰 행운입니다.", numbers: [1, 8, 14, 21, 27, 33, 38, 42, 45] },
      { id: "baby", emoji: "👶", name: "아기", interpretation: "새로운 시작과 희망을 상징합니다. 태몽이면 특히 길한 꿈입니다.", numbers: [3, 9, 15, 22, 28, 34, 39, 41, 43] },
      { id: "celebrity", emoji: "⭐", name: "유명인", interpretation: "사회적 인정과 명예를 상징합니다. 좋은 소식이 찾아옵니다.", numbers: [2, 7, 13, 20, 26, 32, 37, 40, 44] },
      { id: "wedding", emoji: "💒", name: "결혼식", interpretation: "새로운 결합과 축복을 의미합니다. 인생의 전환점이 됩니다.", numbers: [4, 10, 16, 23, 29, 35, 36, 42, 45] },
      { id: "fight", emoji: "💢", name: "싸움", interpretation: "갈등 해소와 승리를 의미합니다. 싸워서 이기면 경쟁에서 승리합니다.", numbers: [5, 11, 17, 24, 30, 31, 38, 43, 44] },
      { id: "king", emoji: "👑", name: "왕/대통령", interpretation: "최고의 권위와 성공을 상징합니다. 큰 행운이 찾아옵니다.", numbers: [1, 6, 12, 19, 25, 33, 39, 41, 45] },
    ],
  },
  {
    id: "action",
    emoji: "🏃",
    name: "행동",
    description: "특정 행동을 하는 꿈",
    keywords: [
      { id: "flying", emoji: "🕊️", name: "하늘을 날기", interpretation: "자유와 상승을 상징합니다. 높이 날수록 큰 성공을 의미합니다.", numbers: [1, 7, 14, 20, 27, 34, 39, 43, 45] },
      { id: "falling", emoji: "😱", name: "떨어지기", interpretation: "불안의 해소를 의미합니다. 떨어져도 다치지 않으면 오히려 길몽입니다.", numbers: [3, 9, 16, 22, 29, 35, 37, 41, 44] },
      { id: "running", emoji: "🏃", name: "달리기", interpretation: "목표를 향한 전진을 상징합니다. 빨리 달리면 빠른 성취를 의미합니다.", numbers: [2, 8, 15, 21, 28, 31, 38, 42, 43] },
      { id: "swimming", emoji: "🏊", name: "수영하기", interpretation: "어려움을 극복하는 힘을 상징합니다. 물에서 자유롭게 수영하면 길몽입니다.", numbers: [4, 10, 17, 23, 26, 33, 36, 40, 45] },
      { id: "eating", emoji: "🍽️", name: "먹기", interpretation: "풍요와 만족을 의미합니다. 맛있게 먹으면 좋은 일이 생깁니다.", numbers: [5, 11, 18, 24, 30, 32, 37, 41, 44] },
      { id: "climbing", emoji: "🧗", name: "오르기", interpretation: "도전과 성취를 상징합니다. 정상에 도달하면 목표를 이룹니다.", numbers: [6, 12, 19, 25, 29, 34, 38, 42, 45] },
    ],
  },
  {
    id: "place",
    emoji: "🏠",
    name: "장소",
    description: "특정 장소가 나오는 꿈",
    keywords: [
      { id: "house", emoji: "🏠", name: "집", interpretation: "안정과 가정의 행복을 상징합니다. 큰 집은 부의 상징입니다.", numbers: [3, 8, 14, 21, 27, 33, 38, 42, 44] },
      { id: "ocean", emoji: "🌊", name: "바다", interpretation: "무한한 가능성과 큰 재물을 상징합니다. 넓은 바다는 큰 행운입니다.", numbers: [1, 7, 13, 20, 26, 32, 39, 41, 45] },
      { id: "school", emoji: "🏫", name: "학교", interpretation: "배움과 성장을 의미합니다. 시험에 합격하면 목표 달성을 암시합니다.", numbers: [2, 9, 15, 22, 28, 34, 37, 40, 43] },
      { id: "temple", emoji: "🛕", name: "절/교회", interpretation: "영적 보호와 축복을 의미합니다. 기도가 응답되는 길몽입니다.", numbers: [4, 10, 16, 23, 29, 35, 36, 41, 44] },
      { id: "road", emoji: "🛤️", name: "길", interpretation: "인생의 방향과 여정을 상징합니다. 넓은 길은 순탄한 미래를 의미합니다.", numbers: [5, 11, 17, 24, 30, 31, 38, 42, 45] },
      { id: "sky", emoji: "🌌", name: "하늘", interpretation: "희망과 꿈을 상징합니다. 맑은 하늘은 밝은 미래를 예고합니다.", numbers: [6, 12, 18, 25, 27, 33, 39, 43, 44] },
    ],
  },
  {
    id: "luck",
    emoji: "🌈",
    name: "숫자/행운",
    description: "행운과 관련된 꿈",
    keywords: [
      { id: "lottery-win", emoji: "🎉", name: "복권 당첨", interpretation: "역설적이지만 당첨 꿈은 기대와 희망을 반영합니다. 의외의 행운이 찾아옵니다.", numbers: [1, 8, 15, 22, 29, 34, 39, 42, 45] },
      { id: "pick-money", emoji: "💰", name: "돈 줍기", interpretation: "뜻밖의 횡재를 의미합니다. 큰 돈을 주우면 큰 행운이 옵니다.", numbers: [3, 7, 14, 21, 28, 33, 38, 41, 44] },
      { id: "gambling", emoji: "🎲", name: "도박/게임", interpretation: "모험과 도전을 상징합니다. 이기면 큰 성과를 얻습니다.", numbers: [2, 9, 16, 23, 30, 35, 37, 40, 43] },
      { id: "rainbow", emoji: "🌈", name: "무지개", interpretation: "희망과 행운의 상징입니다. 무지개를 보면 좋은 일이 생깁니다.", numbers: [4, 10, 17, 24, 27, 32, 36, 41, 45] },
      { id: "shooting-star", emoji: "🌠", name: "별똥별", interpretation: "소원 성취를 의미합니다. 소원을 빌면 이루어지는 길몽입니다.", numbers: [5, 11, 18, 25, 31, 34, 39, 43, 44] },
      { id: "four-leaf-clover", emoji: "🍀", name: "네잎클로버", interpretation: "행운의 상징입니다. 찾으면 행운이 찾아옵니다.", numbers: [6, 12, 19, 26, 28, 33, 38, 42, 45] },
    ],
  },
  {
    id: "food",
    emoji: "🍚",
    name: "음식",
    description: "음식이 나오는 꿈",
    keywords: [
      { id: "rice", emoji: "🍚", name: "밥/쌀", interpretation: "풍요와 생활의 안정을 상징합니다. 밥을 많이 먹으면 재물이 늘어납니다.", numbers: [2, 8, 14, 21, 27, 33, 39, 42, 44] },
      { id: "fruit", emoji: "🍎", name: "과일", interpretation: "결실과 보상을 의미합니다. 익은 과일은 노력의 결실을 상징합니다.", numbers: [3, 9, 15, 22, 28, 34, 37, 41, 43] },
      { id: "meat", emoji: "🥩", name: "고기", interpretation: "활력과 에너지를 상징합니다. 고기를 먹으면 건강과 재물운이 좋아집니다.", numbers: [1, 7, 13, 20, 26, 32, 38, 40, 45] },
      { id: "ricecake", emoji: "🍡", name: "떡", interpretation: "경사와 축하를 의미합니다. 떡을 나눠먹으면 기쁜 소식이 옵니다.", numbers: [4, 10, 16, 23, 29, 35, 36, 43, 44] },
      { id: "alcohol", emoji: "🍶", name: "술", interpretation: "사교와 즐거움을 상징합니다. 적당히 마시면 좋은 인연을 만납니다.", numbers: [5, 11, 17, 24, 30, 31, 39, 41, 45] },
    ],
  },
];

export function generateDreamNumbers(keywordId: string): number[] {
  for (const category of DREAM_CATEGORIES) {
    const keyword = category.keywords.find((k) => k.id === keywordId);
    if (keyword) {
      const pool = [...keyword.numbers];
      const selected: number[] = [];
      while (selected.length < LOTTO_NUMBERS_PER_SET && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
      }
      return selected.sort((a, b) => a - b);
    }
  }
  return [];
}

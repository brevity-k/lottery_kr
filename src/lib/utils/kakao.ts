import { KAKAO_APP_KEY } from "@/lib/constants";

declare global {
  interface Window {
    Kakao?: {
      init(appKey: string): void;
      isInitialized(): boolean;
      Share: {
        sendDefault(settings: {
          objectType: string;
          text: string;
          link: { mobileWebUrl: string; webUrl: string };
        }): void;
      };
    };
  }
}

/**
 * Initializes the Kakao SDK if not already initialized and returns the instance.
 * Returns null if the SDK script hasn't loaded yet.
 */
export function getKakaoSDK(): NonNullable<typeof window.Kakao> | null {
  const Kakao = window.Kakao;
  if (!Kakao) return null;
  if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_APP_KEY);
  }
  return Kakao;
}

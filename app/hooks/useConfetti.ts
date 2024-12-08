import { useEffect, useCallback } from "react";
import { useReward } from "react-rewards";

type UseConfettiOptions = {
  lifetime?: number;
  startVelocity?: number;
  elementId?: string;
  triggerOnMount?: boolean;
  triggerCondition?: boolean;
};

export const useConfetti = ({
  lifetime = 2000,
  startVelocity = 45,
  elementId = "confettiReward",
  triggerOnMount = false,
  triggerCondition = false,
}: UseConfettiOptions = {}) => {
  const { reward: rewardLeft } = useReward(`${elementId}Left`, "confetti", {
    lifetime,
    spread: 45,
    startVelocity,
    position: "fixed",
    elementCount: 75,
    angle: 45,  // 左下から右上へ
    zIndex: 9999,
  });

  const { reward: rewardRight } = useReward(`${elementId}Right`, "confetti", {
    lifetime,
    spread: 45,
    startVelocity,
    position: "fixed",
    elementCount: 75,
    angle: 135,  // 右下から左上へ
    zIndex: 9999,
  });

  const showConfetti = useCallback(() => {
    if (typeof window === 'undefined') return;
    rewardLeft();
    rewardRight();
  }, [rewardLeft, rewardRight]);

  useEffect(() => {
    if (triggerOnMount && triggerCondition) {
      showConfetti();
    }
  }, [showConfetti, triggerOnMount, triggerCondition]);

  return {
    reward: showConfetti,
    elementIdLeft: `${elementId}Left`,
    elementIdRight: `${elementId}Right`,
  };
}; 
import { useEffect, useCallback, useMemo } from "react";
import { useReward } from "react-rewards";

type UseConfettiOptions = {
  lifetime?: number;
  startVelocity?: number;
  elementId?: string;
  triggerOnMount?: boolean;
  triggerCondition?: boolean;
};

export const useConfetti = ({
  lifetime = 120,
  startVelocity = 45,
  elementId = "confettiReward",
  triggerOnMount = false,
  triggerCondition = false,
}: UseConfettiOptions = {}) => {
  const [leftConfig, rightConfig] = useMemo(() => {
    // react-rewards counts lifetime in animation frames, not milliseconds.
    const shared = {
      lifetime,
      fps: 60,
      spread: 45,
      startVelocity,
      position: "fixed" as const,
      elementCount: 75,
      zIndex: 9999,
    };
    return [{ ...shared, angle: 45 }, { ...shared, angle: 135 }];
  }, [lifetime, startVelocity]);

  const { reward: rewardLeft } = useReward(`${elementId}Left`, "confetti", leftConfig);
  const { reward: rewardRight } = useReward(`${elementId}Right`, "confetti", rightConfig);

  const showConfetti = useCallback(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
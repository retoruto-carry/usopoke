import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  isNavigating?: boolean;
};

export function PageTransition({ children, isNavigating }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isNavigating) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [isNavigating]);

  return (
    <div
      className={`
        transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {children}
    </div>
  );
} 
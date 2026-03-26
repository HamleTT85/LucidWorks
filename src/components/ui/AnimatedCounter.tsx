import { useState, useEffect, useRef } from 'react';

interface Props {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function AnimatedCounter({ target, suffix = '+', label, duration = 2000 }: Props) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading text-4xl md:text-5xl font-bold text-[#c8a45c] mb-2">
        {count}{suffix}
      </div>
      <div className="text-[#b0aaa2] text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

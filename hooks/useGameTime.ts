
import { useState, useRef, useCallback } from 'react';
import { Speed, PlaySpeedValue } from '../types';

export const useGameTime = (initialDate: Date) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [speed, setSpeed] = useState<Speed>(null);
  const lastTickRef = useRef<number>(0);

  const pause = useCallback(() => setSpeed(null), []);
  const play = useCallback(() => setSpeed(500), []); // Default speed
  const setGameSpeed = useCallback((newSpeed: Speed) => setSpeed(newSpeed), []);

  return { 
    currentDate, 
    setCurrentDate, 
    speed, 
    setSpeed: setGameSpeed, 
    lastTickRef, 
    pause, 
    play 
  };
};

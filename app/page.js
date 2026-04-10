'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from 'react';

const CARD_IMAGES = Array.from({ length: 17 }, (_, index) => {
  const id = String(index + 1).padStart(2, '0');
  return {
    id,
    title: `Card ${id}`,
    image: `/images/card_${id}.jpeg`
  };
});

const SCRATCH_PRIZES = {
  ticket: {
    label: 'Free Ticket',
    emoji: '🎟️'
  },
  apple: {
    label: 'Free Apple',
    emoji: '🍎'
  }
};
const SCRATCH_REVEAL_LIMIT = 4;
const SCRATCH_MATCH_TO_WIN = 3;
const WHEEL_SECTIONS = 6;
const WHEEL_SPIN_LIMIT = 4;
const WHEEL_MATCH_TO_WIN = 3;
const BUBBLE_COUNT = 12;
const BUBBLE_POP_LIMIT = 5;
const BUBBLE_MATCH_TO_WIN = 3;

const PRIZE_DEFINITIONS = {
  ticket: {
    label: 'Free Ticket',
    emoji: '🎟️',
    line1: 'Free',
    line2: 'Ticket'
  },
  apple: {
    label: 'Free Apple',
    emoji: '🍎',
    line1: 'Free',
    line2: 'Apple'
  },
  banana: {
    label: 'Banana',
    emoji: '🍌',
    line1: 'Banana',
    line2: ''
  },
  peach: {
    label: 'Peach',
    emoji: '🍑',
    line1: 'Peach',
    line2: ''
  }
};

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function createScratchTiles() {
  const basePrizes = [
    ...Array.from({ length: 5 }, () => 'ticket'),
    ...Array.from({ length: 4 }, () => 'apple')
  ];

  return shuffle(basePrizes).map((prize, index) => ({
    id: `scratch-${index + 1}`,
    prize
  }));
}

function createWheelSections() {
  const basePrizes = [
    ...Array.from({ length: 3 }, () => 'ticket'),
    ...Array.from({ length: 3 }, () => 'apple')
  ];

  return shuffle(basePrizes).map((prize, index) => ({
    id: `wheel-${index + 1}`,
    prize
  }));
}

function createBubbleBoard() {
  const randomPrizePool = shuffle(
    Array.from({ length: 9 }, (_, index) => (index < 5 ? 'apple' : 'ticket'))
  );
  const prizes = shuffle(['banana', 'banana', 'peach', ...randomPrizePool]);
  const placed = [];

  return shuffle(prizes).map((prize, index) => {
    let left = 20;
    let top = 30;
    let size = 110;
    let placedOk = false;

    for (let attempt = 0; attempt < 90; attempt += 1) {
      const candidateSize = 100 + Math.random() * 38;
      const candidateLeft = 10 + Math.random() * 80;
      const candidateTop = 16 + Math.random() * 68;

      const collision = placed.some((other) => {
        const minDistance = (candidateSize + other.size) * 0.34;
        const dx = candidateLeft - other.left;
        const dy = candidateTop - other.top;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      if (!collision) {
        left = candidateLeft;
        top = candidateTop;
        size = candidateSize;
        placed.push({ left, top, size });
        placedOk = true;
        break;
      }
    }

    if (!placedOk) {
      const fallbackLeft = 16 + (index % 6) * 13;
      const fallbackTop = 24 + Math.floor(index / 6) * 26;
      left = fallbackLeft;
      top = fallbackTop;
      size = 108;
      placed.push({ left, top, size });
    }

    return {
      id: `bubble-${index + 1}`,
      prize,
      left,
      top,
      size,
      floatY: 12 + Math.random() * 18,
      floatX: (Math.random() - 0.5) * 14,
      duration: 4.8 + Math.random() * 3.4,
      delay: Math.random() * 2.2
    };
  });
}

function getOrientation() {
  if (typeof window === 'undefined') {
    return 'portrait';
  }

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

function calculateCardFrame(mode, orientation) {
  const width = typeof window === 'undefined' ? 390 : window.innerWidth;
  const height = typeof window === 'undefined' ? 844 : window.innerHeight;
  const safePadding = 24;
  const topArea = mode === 'results' ? 180 : 150;
  const bottomArea = mode === 'vote' ? 84 : 110;

  if (orientation === 'landscape') {
    const maxHeight = Math.floor((height - safePadding * 2 - topArea - 32) * (mode === 'vote' ? 0.9 : 1));
    const maxWidth = Math.floor(mode === 'vote' ? (width - 170) / 2 : width * 0.35);

    return {
      width: Math.max(160, Math.min(maxWidth, Math.floor(maxHeight * 0.76))),
      height: Math.max(210, Math.min(maxHeight, Math.floor(maxWidth / 0.76)))
    };
  }

  const availableHeight = height - safePadding * 2 - topArea - bottomArea;
  const stackedHeight = mode === 'vote' ? Math.floor((availableHeight - 18) / 2) : Math.floor(availableHeight * 0.92);
  const maxWidth = Math.floor(width * 0.72);

  return {
    width: Math.max(170, Math.min(maxWidth, Math.floor(stackedHeight * 0.76))),
    height: Math.max(220, Math.min(stackedHeight, Math.floor(maxWidth / 0.76)))
  };
}

function calculateScratchCell(orientation) {
  const width = typeof window === 'undefined' ? 390 : window.innerWidth;
  const height = typeof window === 'undefined' ? 844 : window.innerHeight;
  const sidePaddingRatio = orientation === 'landscape' ? 3 / 16 : 1 / 12;
  const horizontalPadding = Math.floor(width * sidePaddingRatio * 2);
  const verticalChrome = orientation === 'landscape' ? 230 : 310;

  if (orientation === 'landscape') {
    const maxBoardWidth = Math.max(270, Math.min(620, width - horizontalPadding));
    const maxBoardHeight = Math.max(270, Math.min(500, height - verticalChrome));
    const side = Math.floor(Math.min(maxBoardWidth, maxBoardHeight) / 3);

    return Math.max(86, side);
  }

  const maxBoardHeight = Math.max(258, Math.min(560, height - verticalChrome));
  const maxBoardWidth = Math.max(258, Math.min(560, width - horizontalPadding));
  const side = Math.floor(Math.min(maxBoardWidth, maxBoardHeight) / 3);

  return Math.max(88, side);
}

function calculateWheelSize(orientation) {
  const width = typeof window === 'undefined' ? 390 : window.innerWidth;
  const height = typeof window === 'undefined' ? 844 : window.innerHeight;
  const horizontalPadding = orientation === 'landscape' ? width * (3 / 16) * 2 : width * (1 / 12) * 2;
  const verticalChrome = orientation === 'landscape' ? 220 : 300;
  const maxByWidth = Math.max(260, width - horizontalPadding);
  const maxByHeight = Math.max(260, height - verticalChrome);
  const side = Math.floor(Math.min(maxByWidth, maxByHeight));

  return Math.max(250, Math.min(side, orientation === 'landscape' ? 520 : 620));
}

function createVoteSession(shortlisted) {
  if (shortlisted.length < 2) {
    return null;
  }

  return {
    pool: shortlisted,
    seeded: false,
    seedPair: [shortlisted[0], shortlisted[1]],
    ranking: [],
    challengerIndex: 2,
    low: 0,
    high: 0,
    compareIndex: 0,
    challenger: null
  };
}

function advanceVoteSession(session, winnerId) {
  if (!session) {
    return { completed: true, ranking: [] };
  }

  if (!session.seeded) {
    const [cardA, cardB] = session.seedPair;
    const winner = winnerId === cardA.id ? cardA : cardB;
    const loser = winnerId === cardA.id ? cardB : cardA;
    const ranking = [winner, loser];

    if (session.pool.length === 2) {
      return { completed: true, ranking };
    }

    const challenger = session.pool[2];
    const low = 0;
    const high = ranking.length;
    const compareIndex = Math.floor((low + high) / 2);

    return {
      completed: false,
      session: {
        ...session,
        seeded: true,
        ranking,
        challengerIndex: 2,
        low,
        high,
        compareIndex,
        challenger
      }
    };
  }

  const challenger = session.challenger;
  const compareCard = session.ranking[session.compareIndex];
  let low = session.low;
  let high = session.high;

  if (winnerId === challenger.id) {
    high = session.compareIndex;
  } else if (compareCard) {
    low = session.compareIndex + 1;
  }

  if (low >= high) {
    const ranking = [...session.ranking];
    ranking.splice(low, 0, challenger);
    const nextIndex = session.challengerIndex + 1;

    if (nextIndex >= session.pool.length) {
      return { completed: true, ranking };
    }

    const nextChallenger = session.pool[nextIndex];
    const nextLow = 0;
    const nextHigh = ranking.length;
    const nextCompareIndex = Math.floor((nextLow + nextHigh) / 2);

    return {
      completed: false,
      session: {
        ...session,
        ranking,
        challengerIndex: nextIndex,
        challenger: nextChallenger,
        low: nextLow,
        high: nextHigh,
        compareIndex: nextCompareIndex
      }
    };
  }

  return {
    completed: false,
    session: {
      ...session,
      low,
      high,
      compareIndex: Math.floor((low + high) / 2)
    }
  };
}

function getVotePair(session) {
  if (!session) {
    return null;
  }

  if (!session.seeded) {
    return {
      left: session.seedPair[0],
      right: session.seedPair[1]
    };
  }

  return {
    left: session.challenger,
    right: session.ranking[session.compareIndex]
  };
}

function CardView({ card, cardSize, swipeDx = 0, animate = false, onPointerDown, onPointerMove, onPointerUp, showHint = false }) {
  return (
    <div
      className={`card-shell ${animate ? 'card-shell-animate' : ''}`}
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
        transform: `translate3d(${swipeDx}px, 0, 0) rotate(${swipeDx / 18}deg)`
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img className="card-image" src={card.image} alt={card.title} draggable="false" />
      {showHint ? (
        <div className="card-badge-row">
          <span className="card-badge card-badge-left">Skip</span>
          <span className="card-badge card-badge-right">Keep</span>
        </div>
      ) : null}
    </div>
  );
}

function ScratchTile({ tile, size, disabled = false, onRevealed }) {
  const canvasRef = useRef(null);
  const pointerIdRef = useRef(null);
  const drawingRef = useRef(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    revealedRef.current = false;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(size * dpr);
    const height = Math.floor(size * dpr);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
    context.clearRect(0, 0, size, size);

    const gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#dde2e6');
    gradient.addColorStop(0.45, '#aeb7bf');
    gradient.addColorStop(1, '#8f98a3');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    context.globalAlpha = 0.2;
    for (let index = 0; index < 95; index += 1) {
      const noiseSize = 3 + Math.random() * 8;
      context.fillStyle = index % 2 === 0 ? '#f8fbff' : '#6a7480';
      context.fillRect(Math.random() * size, Math.random() * size, noiseSize, noiseSize);
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'destination-out';
  }, [size, tile.id]);

  function scratchAt(event) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.beginPath();
    context.arc(x, y, Math.max(16, size * 0.12), 0, Math.PI * 2);
    context.fill();
  }

  function checkRevealed() {
    if (revealedRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return;
    }

    const sampleStep = 8;
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    let samples = 0;

    for (let y = 0; y < canvas.height; y += sampleStep) {
      for (let x = 0; x < canvas.width; x += sampleStep) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha < 18) {
          transparentPixels += 1;
        }
        samples += 1;
      }
    }

    if (samples > 0 && transparentPixels / samples >= 0.46) {
      revealedRef.current = true;
      onRevealed(tile.id);
    }
  }

  function onPointerDown(event) {
    if (disabled || revealedRef.current) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    drawingRef.current = true;

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {}

    scratchAt(event);
  }

  function onPointerMove(event) {
    if (disabled || !drawingRef.current || pointerIdRef.current !== event.pointerId) {
      return;
    }

    scratchAt(event);
  }

  function onPointerUp(event) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    drawingRef.current = false;
    pointerIdRef.current = null;

    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {}

    checkRevealed();
  }

  return (
    <div className={`scratch-tile ${disabled ? 'scratch-tile-disabled' : ''}`}>
      <div className="scratch-reward">
        <div className="scratch-emoji">{SCRATCH_PRIZES[tile.prize].emoji}</div>
        <div className="scratch-label">{SCRATCH_PRIZES[tile.prize].label}</div>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-overlay"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}

export default function HomePage() {
  const [orientation, setOrientation] = useState('portrait');
  const [screen, setScreen] = useState('start');
  const [deck, setDeck] = useState([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [shortlisted, setShortlisted] = useState([]);
  const [results, setResults] = useState([]);
  const [voteSession, setVoteSession] = useState(null);
  const [swipeDx, setSwipeDx] = useState(0);
  const [dragAnimating, setDragAnimating] = useState(false);
  const [scratchTiles, setScratchTiles] = useState([]);
  const [revealedScratchTileIds, setRevealedScratchTileIds] = useState([]);
  const [scratchRound, setScratchRound] = useState(0);
  const [wheelSections, setWheelSections] = useState([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpins, setWheelSpins] = useState([]);
  const [wheelIsSpinning, setWheelIsSpinning] = useState(false);
  const [bubbleTiles, setBubbleTiles] = useState([]);
  const [poppedBubbleIds, setPoppedBubbleIds] = useState([]);

  const pointerIdRef = useRef(null);
  const startXRef = useRef(0);

  useEffect(() => {
    const update = () => setOrientation(getOrientation());

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    const preventGesture = (event) => event.preventDefault();
    document.addEventListener('gesturestart', preventGesture);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      document.removeEventListener('gesturestart', preventGesture);
    };
  }, []);

  const mode = screen === 'vote' ? 'vote' : screen === 'results' ? 'results' : 'swipe';
  const cardSize = useMemo(() => calculateCardFrame(mode, orientation), [mode, orientation]);
  const currentCard = deck[swipeIndex] ?? null;
  const votePair = getVotePair(voteSession);
  const scratchCellSize = useMemo(() => calculateScratchCell(orientation), [orientation]);
  const wheelSize = useMemo(() => calculateWheelSize(orientation), [orientation]);
  const scratchRevealedTiles = scratchTiles.filter((tile) => revealedScratchTileIds.includes(tile.id));
  const scratchCounts = scratchRevealedTiles.reduce((accumulator, tile) => {
    accumulator[tile.prize] = (accumulator[tile.prize] || 0) + 1;
    return accumulator;
  }, {});
  const scratchWinningPrize = Object.entries(scratchCounts).find(([, count]) => count >= SCRATCH_MATCH_TO_WIN)?.[0] ?? null;
  const scratchIsComplete = Boolean(scratchWinningPrize) || revealedScratchTileIds.length >= SCRATCH_REVEAL_LIMIT;
  const scratchDidWin = scratchIsComplete && Boolean(scratchWinningPrize);
  const wheelCounts = wheelSpins.reduce((accumulator, prize) => {
    accumulator[prize] = (accumulator[prize] || 0) + 1;
    return accumulator;
  }, {});
  const wheelWinningPrize = Object.entries(wheelCounts).find(([, count]) => count >= WHEEL_MATCH_TO_WIN)?.[0] ?? null;
  const wheelIsComplete = Boolean(wheelWinningPrize) || wheelSpins.length >= WHEEL_SPIN_LIMIT;
  const poppedBubbles = bubbleTiles.filter((bubble) => poppedBubbleIds.includes(bubble.id));
  const bubbleCounts = poppedBubbles.reduce((accumulator, bubble) => {
    accumulator[bubble.prize] = (accumulator[bubble.prize] || 0) + 1;
    return accumulator;
  }, {});
  const bubbleWinningPrize = Object.entries(bubbleCounts).find(([, count]) => count >= BUBBLE_MATCH_TO_WIN)?.[0] ?? null;
  const bubbleIsComplete = Boolean(bubbleWinningPrize) || poppedBubbleIds.length >= BUBBLE_POP_LIMIT;

  function resetGame() {
    setScreen('start');
    setDeck([]);
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setSwipeDx(0);
    setDragAnimating(false);
    setScratchTiles([]);
    setRevealedScratchTileIds([]);
    setScratchRound(0);
    setWheelSections([]);
    setWheelRotation(0);
    setWheelSpins([]);
    setWheelIsSpinning(false);
    setBubbleTiles([]);
    setPoppedBubbleIds([]);
  }

  function startSwipeGame() {
    setDeck(shuffle(CARD_IMAGES));
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setScratchTiles([]);
    setRevealedScratchTileIds([]);
    setScratchRound(0);
    setWheelSections([]);
    setWheelRotation(0);
    setWheelSpins([]);
    setWheelIsSpinning(false);
    setBubbleTiles([]);
    setPoppedBubbleIds([]);
    setScreen('swipe');
  }

  function startScratchGame() {
    setDeck([]);
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setSwipeDx(0);
    setDragAnimating(false);
    setScratchTiles(createScratchTiles());
    setRevealedScratchTileIds([]);
    setScratchRound((current) => current + 1);
    setBubbleTiles([]);
    setPoppedBubbleIds([]);
    setScreen('scratch');
  }

  function startWheelGame() {
    setDeck([]);
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setSwipeDx(0);
    setDragAnimating(false);
    setScratchTiles([]);
    setRevealedScratchTileIds([]);
    setScratchRound(0);
    setWheelSections(createWheelSections());
    setWheelRotation(0);
    setWheelSpins([]);
    setWheelIsSpinning(false);
    setBubbleTiles([]);
    setPoppedBubbleIds([]);
    setScreen('wheel');
  }

  function startBubbleGame() {
    setDeck([]);
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setSwipeDx(0);
    setDragAnimating(false);
    setScratchTiles([]);
    setRevealedScratchTileIds([]);
    setScratchRound(0);
    setWheelSections([]);
    setWheelRotation(0);
    setWheelSpins([]);
    setWheelIsSpinning(false);
    setBubbleTiles(createBubbleBoard());
    setPoppedBubbleIds([]);
    setScreen('bubble');
  }

  function spinWheel() {
    if (wheelIsSpinning || wheelIsComplete || wheelSections.length !== WHEEL_SECTIONS) {
      return;
    }

    const resultIndex = Math.floor(Math.random() * wheelSections.length);
    const sectorAngle = 360 / wheelSections.length;
    const targetNorm = (360 - resultIndex * sectorAngle) % 360;
    const currentNorm = ((wheelRotation % 360) + 360) % 360;
    const extraTurns = 3 + Math.floor(Math.random() * 3);
    const delta = (targetNorm - currentNorm + 360) % 360 + extraTurns * 360;
    const nextRotation = wheelRotation + delta;

    setWheelIsSpinning(true);
    setWheelRotation(nextRotation);

    window.setTimeout(() => {
      setWheelIsSpinning(false);
      setWheelSpins((current) => [...current, wheelSections[resultIndex].prize]);
    }, 1900);
  }

  function revealScratchTile(tileId) {
    setRevealedScratchTileIds((current) => {
      if (current.includes(tileId) || current.length >= SCRATCH_REVEAL_LIMIT) {
        return current;
      }

      return [...current, tileId];
    });
  }

  function popBubble(bubbleId) {
    if (bubbleIsComplete) {
      return;
    }

    setPoppedBubbleIds((current) => {
      if (current.includes(bubbleId) || current.length >= BUBBLE_POP_LIMIT) {
        return current;
      }

      return [...current, bubbleId];
    });
  }

  function finishSwipe(finalShortlist) {
    if (finalShortlist.length === 0) {
      setResults([]);
      setScreen('results');
      return;
    }

    if (finalShortlist.length === 1) {
      setResults(finalShortlist);
      setScreen('results');
      return;
    }

    const session = createVoteSession(finalShortlist);
    setVoteSession(session);
    setScreen('vote');
  }

  function handleSwipe(direction) {
    if (!currentCard) {
      return;
    }

    const nextShortlist =
      direction === 'right' ? [...shortlisted, currentCard] : shortlisted;
    const nextIndex = swipeIndex + 1;

    setShortlisted(nextShortlist);
    setSwipeIndex(nextIndex);
    setSwipeDx(0);
    setDragAnimating(false);

    if (nextIndex >= deck.length) {
      finishSwipe(nextShortlist);
    }
  }

  function animateSwipe(direction) {
    const width = cardSize.width;
    const destination = direction === 'right' ? width * 1.25 : -width * 1.25;
    setSwipeDx(destination);
    setDragAnimating(true);
    window.setTimeout(() => handleSwipe(direction), 170);
  }

  function handleVote(winnerId) {
    const next = advanceVoteSession(voteSession, winnerId);

    if (next.completed) {
      setResults(next.ranking);
      setVoteSession(null);
      setScreen('results');
      return;
    }

    setVoteSession(next.session);
  }

  function onCardPointerDown(event) {
    if (!currentCard || screen !== 'swipe') {
      return;
    }

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    setDragAnimating(false);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {}
  }

  function onCardPointerMove(event) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    setSwipeDx(event.clientX - startXRef.current);
  }

  function onCardPointerUp(event) {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - startXRef.current;
    const threshold = cardSize.width * 0.32;

    pointerIdRef.current = null;
    startXRef.current = 0;

    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {}

    if (Math.abs(deltaX) >= threshold) {
      animateSwipe(deltaX > 0 ? 'right' : 'left');
      return;
    }

    setSwipeDx(0);
    setDragAnimating(true);
    window.setTimeout(() => setDragAnimating(false), 170);
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (screen === 'swipe' && currentCard) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          animateSwipe('left');
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          animateSwipe('right');
        }
      }

      if (screen === 'vote' && votePair) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handleVote(votePair.left.id);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleVote(votePair.right.id);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentCard, votePair, voteSession, cardSize, shortlisted, swipeIndex]);

  const backgroundImage =
    orientation === 'landscape'
      ? '/images/app_background_16-9.png'
      : '/images/app_background_9-16.png';

  return (
    <main
      className={`app-shell app-shell-${screen}`}
      style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), url("${backgroundImage}")` }}
    >
      {screen === 'start' ? (
        <section className="panel start-panel">
          <h1>PLAY</h1>
          <div className="start-action-row">
            <button className="primary-button" onClick={startSwipeGame}>
              Play Swipe
            </button>
            <button className="primary-button primary-button-alt" onClick={startScratchGame}>
              Play Scratch
            </button>
            <button className="primary-button primary-button-wheel" onClick={startWheelGame}>
              Play Wheel
            </button>
            <button className="primary-button primary-button-bubble" onClick={startBubbleGame}>
              Play Bubble
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'bubble' ? (
        <section className="game-panel bubble-panel">
          <header className="hud bubble-hud">
            <div className="headline-chip">Bubble Round</div>
            <div className="hud-copy">
              <h2>Pop up to 5 bubbles</h2>
              <p>
                You win when 3 popped bubbles match. Popped bubbles reveal emoji only.
              </p>
            </div>
            <div className="progress-pill">
              {poppedBubbleIds.length} / {BUBBLE_POP_LIMIT}
            </div>
          </header>

          <div className="bubble-stage">
            {bubbleTiles.map((bubble) => {
              const popped = poppedBubbleIds.includes(bubble.id);
              return (
                <button
                  key={bubble.id}
                  className={`bubble-tile bubble-stage-item ${popped ? 'bubble-tile-popped' : ''}`}
                  onClick={() => popBubble(bubble.id)}
                  disabled={popped || bubbleIsComplete}
                  style={{
                    left: `${bubble.left}%`,
                    top: `${bubble.top}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    '--bubble-float-y': `${bubble.floatY}px`,
                    '--bubble-float-x': `${bubble.floatX}px`,
                    '--bubble-duration': `${bubble.duration}s`,
                    '--bubble-delay': `${bubble.delay}s`
                  }}
                >
                  {popped ? <span className="bubble-emoji">{PRIZE_DEFINITIONS[bubble.prize].emoji}</span> : <span className="bubble-shine" />}
                </button>
              );
            })}
          </div>

          <footer className="bubble-footer">
            {bubbleIsComplete ? (
              <div className={`scratch-result ${bubbleWinningPrize ? 'scratch-result-win' : 'scratch-result-lose'}`}>
                {bubbleWinningPrize
                  ? `You won: ${PRIZE_DEFINITIONS[bubbleWinningPrize].label}`
                  : 'No 3-match in 5 pops. Try again.'}
              </div>
            ) : (
              <div className="scratch-result scratch-result-neutral">Pop bubbles and match 3 of the same prize.</div>
            )}

            <div className="scratch-buttons">
              <button className="secondary-button" onClick={resetGame}>
                Back
              </button>
              <button className="primary-button primary-button-bubble" onClick={startBubbleGame}>
                New Bubble
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      {screen === 'wheel' ? (
        <section className="game-panel wheel-panel">
          <header className="hud wheel-hud">
            <div className="headline-chip">Wheel Round</div>
            <div className="hud-copy">
              <h2>Spin up to 4 times</h2>
              <p>
                Win when one prize appears 3 times. Sections are shuffled on every new round.
              </p>
            </div>
            <div className="progress-pill">
              {wheelSpins.length} / {WHEEL_SPIN_LIMIT}
            </div>
          </header>

          <div className="wheel-stage">
            <div className="wheel-stage-shell">
              <div className="wheel-wrap" style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}>
                <div className="wheel-pointer" />
                <div
                  className={`wheel-disc ${wheelIsSpinning ? 'wheel-disc-spinning' : ''}`}
                  style={{
                    transform: `rotate(${wheelRotation}deg)`
                  }}
                >
                  <div className="wheel-face" />
                  <div className="wheel-face-glow" />
                  <div className="wheel-ring wheel-ring-outer" />
                  <div className="wheel-ring wheel-ring-inner" />
                  {Array.from({ length: WHEEL_SECTIONS }).map((_, index) => (
                    <div
                      key={`divider-${index}`}
                      className="wheel-divider"
                      style={{ transform: `translateX(-50%) rotate(${-90 + index * 60}deg)` }}
                    />
                  ))}
                  {wheelSections.map((section, index) => {
                    const segment = 360 / WHEEL_SECTIONS;
                    const angleDeg = -90 + index * segment;
                    const radians = (angleDeg * Math.PI) / 180;
                    const radiusPercent = 30;
                    const left = 50 + Math.cos(radians) * radiusPercent;
                    const top = 50 + Math.sin(radians) * radiusPercent;
                    const textRotation = angleDeg + 90;

                    return (
                      <div
                        key={section.id}
                        className="wheel-label"
                        style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -50%) rotate(${textRotation}deg)` }}
                      >
                        <span>{PRIZE_DEFINITIONS[section.prize].emoji}</span>
                        <strong>{PRIZE_DEFINITIONS[section.prize].line1}</strong>
                        <strong>{PRIZE_DEFINITIONS[section.prize].line2}</strong>
                      </div>
                    );
                  })}
                </div>

                <button className="wheel-spin-button" onClick={spinWheel} disabled={wheelIsSpinning || wheelIsComplete}>
                  {wheelIsSpinning ? 'Spinning...' : 'SPIN'}
                </button>
              </div>

              {wheelIsComplete ? (
                <div className={`wheel-result-overlay ${wheelWinningPrize ? 'scratch-result-overlay-win' : 'scratch-result-overlay-lose'}`}>
                  {wheelWinningPrize
                    ? `You won: ${PRIZE_DEFINITIONS[wheelWinningPrize].label}`
                    : 'No 3-match in 4 spins. Try again.'}
                </div>
              ) : null}
            </div>
          </div>

          <footer className="wheel-footer">
            <div className="wheel-history">
              {wheelSpins.length > 0 ? (
                wheelSpins.map((prize, index) => (
                  <div className="wheel-history-chip" key={`${prize}-${index}`}>
                    {PRIZE_DEFINITIONS[prize].emoji} {PRIZE_DEFINITIONS[prize].label}
                  </div>
                ))
              ) : (
                <div className="wheel-history-chip">Tap SPIN to start.</div>
              )}
            </div>

            {!wheelIsComplete ? (
              <div className="scratch-result scratch-result-neutral">Get 3 of the same prize within 4 spins.</div>
            ) : null}

            <div className="scratch-buttons">
              <button className="secondary-button" onClick={resetGame}>
                Back
              </button>
              <button className="primary-button primary-button-wheel" onClick={startWheelGame}>
                New Wheel
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      {screen === 'scratch' ? (
        <section className="game-panel scratch-panel">
          <header className="hud scratch-hud">
            <div className="headline-chip">Scratch Round</div>
            <div className="hud-copy">
              <h2>Scratch up to 4 tiles</h2>
              <p>
                Reveal up to four hidden gifts. Game stops early as soon as three match.
              </p>
            </div>
            <div className="progress-pill">
              {revealedScratchTileIds.length} / {SCRATCH_REVEAL_LIMIT}
            </div>
          </header>

          <div className="scratch-grid-wrap">
            <div
              className={`scratch-grid scratch-grid-${orientation}`}
              style={{
                gridTemplateColumns: `repeat(3, ${scratchCellSize}px)`,
                gridAutoRows: `${scratchCellSize}px`
              }}
            >
              {scratchTiles.map((tile) => (
                <ScratchTile
                  key={`${scratchRound}-${tile.id}`}
                  tile={tile}
                  size={scratchCellSize}
                  disabled={scratchIsComplete || revealedScratchTileIds.includes(tile.id)}
                  onRevealed={revealScratchTile}
                />
              ))}
            </div>

            {scratchIsComplete ? (
              <div className={`scratch-result-overlay ${scratchDidWin ? 'scratch-result-overlay-win' : 'scratch-result-overlay-lose'}`}>
                {scratchDidWin ? (
                  <span>You won: {SCRATCH_PRIZES[scratchWinningPrize].label}</span>
                ) : (
                  <span>No match this round. Try again.</span>
                )}
              </div>
            ) : null}
          </div>

          <footer className="scratch-footer">
            {!scratchIsComplete ? (
              <div className="scratch-result scratch-result-neutral">Keep scratching until 4 tiles are revealed.</div>
            ) : null}

            <div className="scratch-buttons">
              <button className="secondary-button" onClick={resetGame}>
                Back
              </button>
              <button className="primary-button" onClick={startScratchGame}>
                New Scratch
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      {screen === 'swipe' && currentCard ? (
        <section className="game-panel">
          <header className="hud">
            <div className="headline-chip">Swipe Round</div>
            <div className="hud-copy">
              <h2>Keep the cards you like</h2>
              <p>
                Left skips a card, right keeps it for the ranking round.
              </p>
            </div>
            <div className="progress-pill">
              {swipeIndex + 1} / {deck.length}
            </div>
          </header>

          <div className="center-stage">
            <CardView
              card={currentCard}
              cardSize={cardSize}
              swipeDx={swipeDx}
              animate={dragAnimating}
              onPointerDown={onCardPointerDown}
              onPointerMove={onCardPointerMove}
              onPointerUp={onCardPointerUp}
              showHint
            />
          </div>

          <footer className="action-row">
            <button className="choice-button choice-button-left" onClick={() => animateSwipe('left')}>
              Skip
            </button>
            <button className="choice-button choice-button-right" onClick={() => animateSwipe('right')}>
              Keep
            </button>
          </footer>
        </section>
      ) : null}

      {screen === 'vote' && votePair ? (
        <section className="game-panel">
          <header className="hud">
            <div className="headline-chip">Vote Round</div>
            <div className="hud-copy">
              <h2>Which card should rank higher?</h2>
              <p>
                This round inserts each kept card into the final order through pairwise choices.
              </p>
            </div>
            <div className="progress-pill">
              {Math.min((voteSession?.challengerIndex ?? 0) + 1, shortlisted.length)} / {shortlisted.length}
            </div>
          </header>

          <div className={`vote-stage vote-stage-${orientation}`}>
            <button className="vote-card-button" onClick={() => handleVote(votePair.left.id)}>
              <CardView card={votePair.left} cardSize={cardSize} />
            </button>
            <div className="versus-pill">vs</div>
            <button className="vote-card-button" onClick={() => handleVote(votePair.right.id)}>
              <CardView card={votePair.right} cardSize={cardSize} />
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'results' ? (
        <section className="panel results-panel">
          <div className="results-topbar">
            <button className="secondary-button" onClick={resetGame}>
              Restart
            </button>
            <div className="headline-chip">Final Results</div>
          </div>

          <div className="results-copy">
            <h2>Your ranked cards</h2>
            <p>
              {results.length > 1
                ? 'The shortlist was ordered by the head-to-head vote phase.'
                : results.length === 1
                  ? 'Only one card was kept during swiping, so it wins by default.'
                  : 'No cards were kept during swiping.'}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="results-list">
              {results.map((card, index) => (
                <div className="result-row" key={card.id}>
                  <div className="result-rank">#{index + 1}</div>
                  <img className="result-thumb" src={card.image} alt={card.title} />
                  <div className="result-text">{card.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Try again and keep at least one card.</div>
          )}
        </section>
      ) : null}
    </main>
  );
}

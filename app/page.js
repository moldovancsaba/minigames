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
  const safePadding = 24;

  if (orientation === 'landscape') {
    const maxBoardWidth = Math.max(270, Math.min(420, width * 0.52));
    const maxBoardHeight = Math.max(270, Math.min(420, height - safePadding * 2 - 180));
    const side = Math.floor(Math.min(maxBoardWidth, maxBoardHeight) / 3);

    return Math.max(82, side);
  }

  const availableHeight = height - safePadding * 2 - 240;
  const maxBoardHeight = Math.max(258, Math.min(450, availableHeight));
  const maxBoardWidth = Math.max(258, Math.min(450, width * 0.92));
  const side = Math.floor(Math.min(maxBoardWidth, maxBoardHeight) / 3);

  return Math.max(86, side);
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
  const scratchRevealedTiles = scratchTiles.filter((tile) => revealedScratchTileIds.includes(tile.id));
  const scratchIsComplete = revealedScratchTileIds.length >= 3;
  const scratchDidWin =
    scratchIsComplete && new Set(scratchRevealedTiles.map((tile) => tile.prize)).size === 1;

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
    setScreen('scratch');
  }

  function revealScratchTile(tileId) {
    setRevealedScratchTileIds((current) => {
      if (current.includes(tileId) || current.length >= 3) {
        return current;
      }

      return [...current, tileId];
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
          <div className="headline-chip">Minigames</div>
          <h1>Choose a game and start playing.</h1>
          <p>
            Swipe keeps your favorite cards and ranks them. Scratch reveals three rewards from
            a silver ticket grid to find a matching prize.
          </p>
          <div className="start-action-row">
            <button className="primary-button" onClick={startSwipeGame}>
              Play Swipe
            </button>
            <button className="primary-button primary-button-alt" onClick={startScratchGame}>
              Play Scratch
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'scratch' ? (
        <section className="game-panel scratch-panel">
          <header className="hud scratch-hud">
            <div className="headline-chip">Scratch Round</div>
            <div className="hud-copy">
              <h2>Scratch exactly 3 tiles</h2>
              <p>
                Reveal three hidden gifts. Win if all three match: Free Ticket or Free Apple.
              </p>
            </div>
            <div className="progress-pill">
              {revealedScratchTileIds.length} / 3
            </div>
          </header>

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

          <footer className="scratch-footer">
            {scratchIsComplete ? (
              <div className={`scratch-result ${scratchDidWin ? 'scratch-result-win' : 'scratch-result-lose'}`}>
                {scratchDidWin ? (
                  <span>You won: {SCRATCH_PRIZES[scratchRevealedTiles[0].prize].label}</span>
                ) : (
                  <span>No match this round. Try again.</span>
                )}
              </div>
            ) : (
              <div className="scratch-result scratch-result-neutral">Keep scratching until 3 tiles are revealed.</div>
            )}

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

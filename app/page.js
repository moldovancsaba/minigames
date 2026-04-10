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

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
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

async function enterImmersiveMode() {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  try {
    if (!document.fullscreenElement && root.requestFullscreen) {
      await root.requestFullscreen({ navigationUI: 'hide' });
    }
  } catch {}

  try {
    if (window.screen?.orientation?.lock) {
      await window.screen.orientation.lock(getOrientation());
    }
  } catch {}
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

  const pointerIdRef = useRef(null);
  const startXRef = useRef(0);

  useEffect(() => {
    const update = () => setOrientation(getOrientation());
    const refreshAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    const minimizeBrowserChrome = () => {
      refreshAppHeight();
      window.setTimeout(() => window.scrollTo(0, 1), 0);
      window.setTimeout(() => window.scrollTo(0, 0), 60);
    };

    update();
    refreshAppHeight();
    minimizeBrowserChrome();

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.addEventListener('resize', update);
    window.addEventListener('resize', refreshAppHeight);
    window.addEventListener('orientationchange', update);
    window.addEventListener('orientationchange', minimizeBrowserChrome);
    window.addEventListener('load', minimizeBrowserChrome);
    window.addEventListener('pageshow', minimizeBrowserChrome);

    const preventGesture = (event) => event.preventDefault();
    document.addEventListener('gesturestart', preventGesture);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('resize', refreshAppHeight);
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('orientationchange', minimizeBrowserChrome);
      window.removeEventListener('load', minimizeBrowserChrome);
      window.removeEventListener('pageshow', minimizeBrowserChrome);
      document.removeEventListener('gesturestart', preventGesture);
    };
  }, []);

  const mode = screen === 'vote' ? 'vote' : screen === 'results' ? 'results' : 'swipe';
  const cardSize = useMemo(() => calculateCardFrame(mode, orientation), [mode, orientation]);
  const currentCard = deck[swipeIndex] ?? null;
  const votePair = getVotePair(voteSession);

  function resetGame() {
    setScreen('start');
    setDeck([]);
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setSwipeDx(0);
    setDragAnimating(false);
  }

  async function startGame() {
    await enterImmersiveMode();
    setDeck(shuffle(CARD_IMAGES));
    setSwipeIndex(0);
    setShortlisted([]);
    setResults([]);
    setVoteSession(null);
    setScreen('swipe');
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
          <div className="headline-chip">Kids Swipe Game</div>
          <h1>Swipe cards, then choose the winners.</h1>
          <p>
            The game follows Narimato&apos;s business flow: first you keep or skip cards,
            then your kept cards are compared head-to-head until a final ranking is built.
          </p>
          <button className="primary-button" onClick={startGame}>
            Start
          </button>
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

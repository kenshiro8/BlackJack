import React, { useState } from "react";
import "./../style.css";


import cardDrawSound from "./draw_card_sound.mp3"; 
import startSound from "./start.mp3";

const INITIAL_DECK = createDeck();

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app">
      {gameStarted ? (
        <GameScreen 
          initialDeck={INITIAL_DECK}
        />
      ) : (
        <StartScreen onStart={() => setGameStarted(true)} />
      )}
    </div>
  );
}

function StartScreen({ onStart }) {
  const playStartSound = () => {
    const audio = new Audio(startSound);
    audio.play();
  };

  return (
    <div className="start-screen">
      <h1>Blackjack</h1>
      <button className="play-button" onClick={() => { playStartSound(); onStart(); }}>
        Play
      </button>
    </div>
  );
}

function GameScreen({ initialDeck }) {
  const [deck, setDeck] = useState(initialDeck);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState("");
  const [winner, setWinner] = useState("");

  const playCardDrawSound = () => {
    const audio = new Audio(cardDrawSound);
    audio.play();
  };

  const checkBust = () => {
    const playerScore = calculateHandValue(playerHand);
    if (playerScore > 21) {
      setScore("Bust!");
      setGameOver(true);
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    playCardDrawSound();
    setPlayerHand([...playerHand, newCard]);
    setDeck(newDeck);
    
    const playerScore = calculateHandValue([...playerHand, newCard]);
    if (playerScore > 21) {
      setScore("Bust!");
      setGameOver(true);
    }
  };

  const stand = () => {
    let dealerScore = calculateHandValue(dealerHand);
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];
    playCardDrawSound();

    while (dealerScore < 17) {
      const newCard = newDeck.pop();
      newDealerHand.push(newCard);
      dealerScore = calculateHandValue(newDealerHand);
      setDeck(newDeck);
      setDealerHand(newDealerHand);
    }

    const playerScore = calculateHandValue(playerHand);
    if (dealerScore > 21) {
      setScore(`Bust! - ${playerScore}`);
      setWinner("Player");
    } else {
      setScore(`${dealerScore} - ${playerScore}`);
      if (dealerScore > playerScore) {
        setWinner("Dealer");
      } else if (playerScore > dealerScore) {
        setWinner("Player");
      } else {
        setWinner("Tie");
      }
    }

    setGameOver(true);
  };

  const calculateHandValue = (hand) => {
    let value = 0;
    let aceCount = 0;

    hand.forEach(card => {
      value += getCardValue(card);
      if (card.rank === 'A') aceCount++;
    });

    while (value > 21 && aceCount) {
      value -= 10;
      aceCount--;
    }

    return value;
  };

  const getCardValue = (card) => {
    if (['J', 'Q', 'K'].includes(card.rank)) {
      return 10;
    } else if (card.rank === 'A') {
      return 11;
    } else {
      return parseInt(card.rank);
    }
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div className="game-screen">
      <div className="table">
        <div className="dealer-hand">
          <h3>Dealer's Hand</h3>
          {dealerHand.map((card, index) => (
            <div key={index} className="card-container">
              <Card card={card} />
              <div className="card-value">{calculateHandValue(dealerHand)}</div>
            </div>
          ))}
          {winner === "Dealer" && <div className="win-tag">WIN!</div>}
        </div>
        <div className="player-hand">
          <h3>Your Hand</h3>
          {playerHand.map((card, index) => (
            <div key={index} className="card-container">
              <Card card={card} />
              <div className="card-value">{calculateHandValue(playerHand)}</div>
            </div>
          ))}
          {winner === "Player" && <div className="win-tag">WIN!</div>}
        </div>
      </div>
      {score && (
        <div className="score-display">
          <div className="score-label">Dealer Hand - Player Hand</div>
          <div>{score}</div>
        </div>
      )}
      <div className="controls">
        {!gameOver && (
          <div>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </div>
        )}
        {gameOver && (
          <div>
            <button onClick={handlePlayAgain}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ card }) {
  const [rank, suit] = [card.rank, card.suit];
  const suitColor = ["♥", "♦"].includes(suit) ? "red" : "black";

  return (
    <div className="card">
      <div className="card-rank" style={{ color: suitColor }}>{rank}</div>
      <div className="card-suit" style={{ color: suitColor }}>{suit}</div>
    </div>
  );
}

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck = suits.flatMap(suit => ranks.map(rank => ({ rank, suit })));
  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default App;

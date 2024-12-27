import React, { useState } from "react";
import "./../style.css";

const INITIAL_CHIPS = 1000;
const INITIAL_DECK = createDeck();

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app">
      {gameStarted ? (
        <GameScreen 
          initialDeck={INITIAL_DECK}
          initialChips={INITIAL_CHIPS}
        />
      ) : (
        <StartScreen onStart={() => setGameStarted(true)} />
      )}
    </div>
  );
}

function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <h1>Blackjack</h1>
      <button className="play-button" onClick={onStart}>Play</button>
    </div>
  );
}

function GameScreen({ initialDeck, initialChips }) {
  const [deck, setDeck] = useState(initialDeck);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [chips, setChips] = useState(initialChips);
  const [pot, setPot] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const dealCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(newDeck);
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    setPlayerHand([...playerHand, newCard]);
    setDeck(newDeck);
  };

  const stand = () => {
    let dealerScore = calculateHandValue(dealerHand);
    let newDealerHand = [...dealerHand];
    
    // Dealer must keep drawing cards until their hand value is 17 or higher
    while (dealerScore < 17) {
      const newCard = newDeck.pop();
      newDealerHand.push(newCard);
      dealerScore = calculateHandValue(newDealerHand);
      setDeck(newDeck);
    }

    setDealerHand(newDealerHand);
    determineWinner();
  };

  const calculateHandValue = (hand) => {
    let value = 0;
    let aceCount = 0;

    hand.forEach(card => {
      value += getCardValue(card);
      if (card.rank === 'A') aceCount++;
    });

    // Adjust for aces
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

  const determineWinner = () => {
    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerHand);

    let resultMessage = "";
    if (playerScore > 21) {
      resultMessage = "Player Busts! Dealer Wins!";
    } else if (dealerScore > 21) {
      resultMessage = "Dealer Busts! Player Wins!";
    } else if (playerScore > dealerScore) {
      resultMessage = "Player Wins!";
    } else if (playerScore < dealerScore) {
      resultMessage = "Dealer Wins!";
    } else {
      resultMessage = "It's a Tie!";
    }
    
    setGameOver(true);
    alert(resultMessage);
  };

  return (
    <div className="game-screen">
      <div className="chips-display">Your Chips: {chips}</div>
      <div className="table">
        <div className="dealer-hand">
          <h3>Dealer's Hand</h3>
          {dealerHand.map((card, index) => <Card key={index} card={card} />)}
        </div>
        <div className="player-hand">
          <h3>Your Hand</h3>
          {playerHand.map((card, index) => <Card key={index} card={card} />)}
        </div>
      </div>
      <div className="controls">
        {!gameOver && (
          <div>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </div>
        )}
        {gameOver && (
          <button onClick={() => setGameOver(false)}>Play Again</button>
        )}
      </div>
      <div className="pot-display">Pot: {pot}</div>
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

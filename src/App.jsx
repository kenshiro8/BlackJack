import React, { useState } from "react";
import "./../style.css";

// 音声ファイルをインポート
import cardDrawSound from "./draw_card_sound.mp3"; 
import startSound from "./start.mp3"; // ゲーム開始音

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
  // ゲーム開始音を再生
  const playStartSound = () => {
    const audio = new Audio(startSound); // インポートしたゲーム開始音を再生
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
  const [score, setScore] = useState(""); // スコア表示用
  const [winner, setWinner] = useState(""); // WIN! 表示用

  // 音声ファイルを再生
  const playCardDrawSound = () => {
    const audio = new Audio(cardDrawSound); // インポートした音声を再生
    audio.play();
  };

  const checkBust = () => {
    const playerScore = calculateHandValue(playerHand);
    if (playerScore > 21) {
      setScore("Bust!"); // プレイヤーがバストした場合
      setGameOver(true); // ゲーム終了
    }
  };

  const dealCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(newDeck);
    checkBust(); // 最初のカード配布後にバストチェック
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    playCardDrawSound();
    setPlayerHand([...playerHand, newCard]);
    setDeck(newDeck);
    
    // 合計が21を超えた場合にBustを表示
    const playerScore = calculateHandValue([...playerHand, newCard]);
    if (playerScore > 21) {
      setScore("Bust!"); // プレイヤーがバストした場合
      setGameOver(true); // ゲーム終了
    }
  };

  const stand = () => {
    let dealerScore = calculateHandValue(dealerHand);
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];
    playCardDrawSound();

    // ディーラーが17以上になるまでカードを引く
    while (dealerScore < 17) {
      const newCard = newDeck.pop();
      newDealerHand.push(newCard);
      dealerScore = calculateHandValue(newDealerHand);
      setDeck(newDeck);
      setDealerHand(newDealerHand); // 手札を更新
    }

    // 両者のスコアが21以下の場合、スコアの大きい方に「WIN!」表示
    const playerScore = calculateHandValue(playerHand);
    if (dealerScore > 21) {
      setScore(`Bust! - ${playerScore}`); // ディーラーがバストした場合、プレイヤーのスコアを表示
      setWinner("Player"); // プレイヤーの勝ち
    } else {
      setScore(`${dealerScore} - ${playerScore}`); // 中央にスコア表示
      if (dealerScore > playerScore) {
        setWinner("Dealer"); // ディーラーが勝ち
      } else if (playerScore > dealerScore) {
        setWinner("Player"); // プレイヤーが勝ち
      } else {
        setWinner("Tie"); // 引き分け
      }
    }

    setGameOver(true); // ゲームを終了
  };

  // 手札の合計値を計算
  const calculateHandValue = (hand) => {
    let value = 0;
    let aceCount = 0;

    hand.forEach(card => {
      value += getCardValue(card);
      if (card.rank === 'A') aceCount++; // Aの枚数をカウント
    });

    // Aを11とカウントしてもバーストしない場合、11に設定
    while (value > 21 && aceCount) {
      value -= 10; // バーストする場合、Aを1として再計算
      aceCount--;
    }

    return value;
  };

  // カードの値を取得
  const getCardValue = (card) => {
    if (['J', 'Q', 'K'].includes(card.rank)) {
      return 10; // J, Q, Kは10としてカウント
    } else if (card.rank === 'A') {
      return 11; // Aは初期で11としてカウント
    } else {
      return parseInt(card.rank); // 数字カードはそのまま値を返す
    }
  };

  const handlePlayAgain = () => {
    window.location.reload(); // ページをリロードしてゲームを初期化
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
      {/* スコアを画面中央に表示 */}
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

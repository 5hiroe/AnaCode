const Game = require('./game.js');

describe("Game Class", function() {
  let game;

  beforeEach(() => {
    game = new Game();
    game.addPlayer('Chet');
    game.addPlayer('Pat');
    game.addPlayer('Sue');
  });

  it("should add players correctly", function() {
    expect(game.howManyPlayers()).toBe(3);
    expect(game.players).toEqual(['Chet', 'Pat', 'Sue']);
  });

  it("should correctly identify the current category based on position", function() {
    expect(game.getCategory(0)).toBe('Pop');
    expect(game.getCategory(1)).toBe('Science');
    expect(game.getCategory(2)).toBe('Sports');
    expect(game.getCategory(3)).toBe('Rock');
    expect(game.getCategory(4)).toBe('Pop');
  });

  it("should handle rolling the dice", function() {
    game.rollDice(2);
    expect(game.places[0]).toBe(2);
  });

  it("should handle correctly answered questions", function() {
    game.rollDice(2);
    const winner = game.wasCorrectlyAnswered();
    expect(winner).toBe(true);
    expect(game.purses[0]).toBe(1);
    expect(game.currentPlayer).toBe(1);
  });

  it("should handle incorrectly answered questions", function() {
    game.rollDice(2);
    game.wrongAnswer();
    expect(game.inPenaltyBox[0]).toBe(true);
    expect(game.currentPlayer).toBe(1);
  });

  it("should handle getting out of the penalty box with an odd roll", function() {
    game.rollDice(2);
    game.wrongAnswer();
    expect(game.inPenaltyBox[0]).toBe(true);

    game.rollDice(3); // Odd roll
    expect(game.isGettingOutOfPenaltyBox).toBe(true);
    expect(game.places[0]).toBe(5);
  });

  it("should stay in the penalty box with an even roll", function() {
    game.rollDice(2);
    game.wrongAnswer();
    expect(game.inPenaltyBox[0]).toBe(true);

    game.rollDice(2); // Even roll
    expect(game.isGettingOutOfPenaltyBox).toBe(false);
    expect(game.places[0]).toBe(2); // No change in position
  });

  it("should correctly determine a win", function() {
    for (let i = 0; i < 5; i++) {
      game.rollDice(2);
      game.wasCorrectlyAnswered();
    }
    game.rollDice(2);
    const winner = game.wasCorrectlyAnswered();
    expect(winner).toBe(false);
    expect(game.purses[0]).toBe(6);
  });

  it("should handle edge case of player winning after multiple correct answers", function() {
    game.rollDice(2);
    for (let i = 0; i < 5; i++) {
      game.wasCorrectlyAnswered();
    }
    const winner = game.wasCorrectlyAnswered();
    expect(winner).toBe(false);
    expect(game.purses[0]).toBe(6);
  });

  it("should ask the correct question based on the current category", function() {
    game.rollDice(0);
    expect(game.currentCategory()).toBe('Pop');
    game.rollDice(1);
    expect(game.currentCategory()).toBe('Science');
    game.rollDice(2);
    expect(game.currentCategory()).toBe('Sports');
    game.rollDice(3);
    expect(game.currentCategory()).toBe('Rock');
  });

  it("should not allow a game to be played with less than 2 players", function() {
    const singlePlayerGame = new Game();
    singlePlayerGame.addPlayer('OnlyPlayer');
    expect(singlePlayerGame.isPlayable()).toBe(false);
  });

  it("should allow a game to be played with 2 or more players", function() {
    expect(game.isPlayable()).toBe(true);
  });
});

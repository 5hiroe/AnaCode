const fs = require('fs');
const Game = require('./game.js');

describe('Golden Master', () => {
  it('should match the golden master', () => {
    const goldenMaster = JSON.parse(fs.readFileSync('golden_master.json', 'utf-8'));

    const game = new Game();
    game.addPlayer('Chet');
    game.addPlayer('Pat');
    game.addPlayer('Sue');

    let states = [];

    let notAWinner;
    do {
      const roll = Math.floor(Math.random() * 6) + 1;
      const wrongAnswer = Math.floor(Math.random() * 10) === 7;

      game.rollDice(roll);
      if (wrongAnswer) {
        notAWinner = game.wrongAnswer();
      } else {
        notAWinner = game.wasCorrectlyAnswered();
      }

      states.push({
        currentPlayer: game.players[game.currentPlayer],
        places: [...game.places],
        purses: [...game.purses],
        inPenaltyBox: [...game.inPenaltyBox],
        isGettingOutOfPenaltyBox: game.isGettingOutOfPenaltyBox,
      });
    } while (notAWinner);

    expect(states).toEqual(goldenMaster);
  });
});

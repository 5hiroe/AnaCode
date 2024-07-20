const winston = require('winston');

class Game {
    constructor() {
      // Initialisation des propriétés de l'instance
      this.players = [];
      this.places = new Array(6).fill(0);
      this.purses = new Array(6).fill(0);
      this.inPenaltyBox = new Array(6).fill(false);
      this.jokers = new Array(6).fill(true);
  
      // Initialisation des questions pour chaque catégorie
      this.popQuestions = [];
      this.scienceQuestions = [];
      this.sportsQuestions = [];
      this.rockQuestions = [];
  
      // Variables pour suivre l'état du jeu
      this.currentPlayer = 0;
      this.isGettingOutOfPenaltyBox = false;
  
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.simple(),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'game.log' })
        ]
      });

      this.initializeQuestions();
    }
  
    // Méthode pour initialiser les questions pour chaque catégorie
    initializeQuestions() {
      for (let i = 0; i < 50; i++) {
        this.popQuestions.push(`Pop Question ${i}`);
        this.scienceQuestions.push(`Science Question ${i}`);
        this.sportsQuestions.push(`Sports Question ${i}`);
        this.rockQuestions.push(`Rock Question ${i}`);
      }
    }
  
    // Méthode pour vérifier si le jeu est jouable (au moins 2 joueurs)
    isPlayable() {
      return this.players.length >= 2;
    }
  
    // Méthode pour ajouter un joueur
    addPlayer(playerName) {
      this.players.push(playerName);
      this.places[this.players.length - 1] = 0;
      this.purses[this.players.length - 1] = 0;
      this.inPenaltyBox[this.players.length - 1] = false;
      this.jokers[this.players.length - 1] = true;
      this.log(`${playerName} was added`);
      this.log(`They are player number ${this.players.length}`);
      return true;
    }
  
    // Méthode pour obtenir le nombre de joueurs
    howManyPlayers() {
      return this.players.length;
    }
  
    // Méthode pour déterminer la catégorie en fonction de la position
    getCategory(position) {
      const categories = ['Pop', 'Science', 'Sports', 'Rock'];
      return categories[position % 4];
    }
  
    // Méthode pour obtenir la catégorie actuelle
    currentCategory() {
      return this.getCategory(this.places[this.currentPlayer]);
    }
  
    // Méthode pour poser une question de la catégorie actuelle
    askQuestion() {
      switch (this.currentCategory()) {
        case 'Pop':
          this.log(this.popQuestions.shift());
          break;
        case 'Science':
          this.log(this.scienceQuestions.shift());
          break;
        case 'Sports':
          this.log(this.sportsQuestions.shift());
          break;
        case 'Rock':
          this.log(this.rockQuestions.shift());
          break;
      }
    }
  
    // Méthode pour gérer le lancer de dé
    rollDice(roll) {
        this.log(`${this.players[this.currentPlayer]} is the current player`);
        this.log(`They have rolled a ${roll}`);

        if (this.inPenaltyBox[this.currentPlayer]) {
            this.handlePenaltyBoxRoll(roll);
          } else {
            this.movePlayer(roll);
            this.log(`The category is ${this.currentCategory()}`);
            this.askQuestion();
          }
    }

    // Nouvelle méthode pour gérer le lancer de dé quand le joueur est dans la boîte de pénalité
    handlePenaltyBoxRoll(roll) {
        if (roll % 2 !== 0) {
            this.isGettingOutOfPenaltyBox = true;
            this.log(`${this.players[this.currentPlayer]} is getting out of the penalty box`);
            this.movePlayer(roll);
            this.log(`The category is ${this.currentCategory()}`);
            this.askQuestion();
          } else {
            this.log(`${this.players[this.currentPlayer]} is not getting out of the penalty box`);
            this.isGettingOutOfPenaltyBox = false;
            this.nextPlayer();  // Ajouter le changement de joueur
          }
    }

    // Nouvelle méthode pour déplacer le joueur
    movePlayer(roll) {
        this.places[this.currentPlayer] += roll;
        this.places[this.currentPlayer] %= 12;
        this.log(`${this.players[this.currentPlayer]}'s new location is ${this.places[this.currentPlayer]}`);
    }
  
    // Méthode pour gérer une réponse correcte
    wasCorrectlyAnswered() {
        if (this.inPenaltyBox[this.currentPlayer]) {
            if (this.isGettingOutOfPenaltyBox) {
              this.log('Answer was correct!!!!');
              this.purses[this.currentPlayer] += 1;
              this.log(`${this.players[this.currentPlayer]} now has ${this.purses[this.currentPlayer]} Gold Coins.`);
        
              const winner = this.didPlayerWin();
              this.nextPlayer();
        
              return !winner;
            } else {
              this.nextPlayer();
              return true;
            }
          } else {
            this.log('Answer was correct!!!!');
            this.purses[this.currentPlayer] += 1;
            this.log(`${this.players[this.currentPlayer]} now has ${this.purses[this.currentPlayer]} Gold Coins.`);
        
            const winner = this.didPlayerWin();
            this.nextPlayer();
        
            return !winner;
          }
    }

    // Méthode pour gérer une réponse correcte quand le joueur est dans la boîte de pénalité
    handleCorrectAnswerInPenaltyBox() {
        if (this.isGettingOutOfPenaltyBox) {
        this.log('Answer was correct!!!!');
        this.purses[this.currentPlayer] += 1;
        this.log(`${this.players[this.currentPlayer]} now has ${this.purses[this.currentPlayer]} Gold Coins.`);

        const winner = this.didPlayerWin();
        this.nextPlayer();

        return winner;
        } else {
        this.nextPlayer();
        return true;
        }
    }

    // Méthode pour gérer une réponse correcte
    handleCorrectAnswer() {
        this.log('Answer was correct!!!!');
        this.purses[this.currentPlayer] += 1;
        this.log(`${this.players[this.currentPlayer]} now has ${this.purses[this.currentPlayer]} Gold Coins.`);

        const winner = this.didPlayerWin();
        this.nextPlayer();

        return !winner;
    }

    // Méthode pour gérer une réponse incorrecte
    wrongAnswer() {
        this.log('Question was incorrectly answered');
        this.log(`${this.players[this.currentPlayer]} was sent to the penalty box`);
        this.inPenaltyBox[this.currentPlayer] = true;

        this.nextPlayer();
        return true;
    }

    useJoker() {
        if (this.jokers[this.currentPlayer]) {
          this.log(`${this.players[this.currentPlayer]} used a joker!`);
          this.jokers[this.currentPlayer] = false;
          this.nextPlayer();
          return true;
        } else {
          this.log(`${this.players[this.currentPlayer]} has no jokers left!`);
          return false;
        }
      }
  
    // Méthode pour passer au joueur suivant
    nextPlayer() {
        this.currentPlayer += 1;
        if (this.currentPlayer === this.players.length) {
        this.currentPlayer = 0;
        }
    }
  
    // Méthode pour vérifier si le joueur a gagné
    didPlayerWin() {
        return this.purses[this.currentPlayer] >= 6;
    }

    // Méthode de journalisation pour remplacer this.log
    log(message) {
        this.logger.info(message);
    }
  }
  
    // Simulation du jeu
    const game = new Game();
    game.addPlayer('Chet');
    game.addPlayer('Pat');
    game.addPlayer('Sue');

    let notAWinner;
    do {
    game.rollDice(Math.floor(Math.random() * 6) + 1);

    if (Math.floor(Math.random() * 10) === 7) {
        notAWinner = game.wrongAnswer();
    } else {
        notAWinner = game.wasCorrectlyAnswered();
    }
    } while (notAWinner);

    module.exports = Game;
  
export class User {
    constructor(username) {
      this.username = username;
      this.score = 0;
      this.scoreHistory = [];
    }
  
    updateScore(points) {
      this.score = this.score + points;
      this.scoreHistory.push(this.score);
    }
  
    getCurrentScore() {
      return this.score;
    }
  
    getScoreHistory() {
      return this.scoreHistory;
    }

    resetScore() {
      this.score = 0;
      this.scoreHistory = [];
    }
  }
  
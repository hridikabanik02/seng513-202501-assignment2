export class User {
    constructor(username) {
      this.username = username;
      this.score = 0;
      this.scoreHistory = [];
    }
  
    updateScore(points) {
      this.scoreHistory.push(points);
    }
  
    getScoreHistory() {
      return this.scoreHistory;
    }

    resetScore() {
      this.score = 0;
      this.scoreHistory = [];
    }
  }
  
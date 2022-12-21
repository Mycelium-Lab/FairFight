CREATE TABLE signatures(
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255) NOT NULL,
    player1Amount VARCHAR(255) NOT NULL,
    player2Amount VARCHAR(255) NOT NULL,
    gameID  INT NOT NULL,
    v       INT NOT NULL,
    r       VARCHAR(255) NOT NULL,
    s       VARCHAR(255) NOT NULL
);

CREATE TABLE statistics(
    gameID  INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    playerAmount VARCHAR(255) NOT NULL,
    kills  INT NOT NULL,
    deaths  INT NOT NULL,
    remainingRounds INT NOT NULL
);

CREATE TABLE leaderboard(
    address TEXT NOT NULL,
    games INT NOT NULL,
    wins INT NOT NULL,
    kills INT NOT NULL,
    amountWon FLOAT NOT NULL,
    period INT NOT NULL
);

CREATE TABLE utils(
    id INT NOT NULL,
    currentLeaderboardUpdate INT NOT NULL
);

INSERT INTO utils (id, currentleaderboardupdate) VALUES(0,0);
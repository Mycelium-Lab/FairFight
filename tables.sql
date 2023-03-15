CREATE TABLE signatures(
    player VARCHAR(255) NOT NULL,
    gameid INT NOT NULL,
    amount VARCHAR(255) NOT NULL,
    chainid INT NOT NULL,
    contract VARCHAR(255) NOT NULL,
    v       INT NOT NULL,
    r       VARCHAR(255) NOT NULL,
    s       VARCHAR(255) NOT NULL
);

CREATE TABLE statistics(
    gameid  INT NOT NULL,
    player VARCHAR(255) NOT NULL,
    chainid INT NOT NULL,
    contract VARCHAR(255) NOT NULL,
    amount VARCHAR(255) NOT NULL,
    kills  INT NOT NULL,
    deaths  INT NOT NULL,
    remainingRounds INT NOT NULL
);

CREATE TABLE leaderboard(
    address TEXT NOT NULL,
    games INT NOT NULL,
    wins INT NOT NULL,
    amountWon FLOAT NOT NULL,
    period INT NOT NULL,
    chainid INT NOT NULL,
    contract VARCHAR(255) NOT NULL
);

CREATE TABLE utils(
    id INT NOT NULL,
    currentLeaderboardUpdate INT NOT NULL
);

INSERT INTO utils (id, currentleaderboardupdate) VALUES(0,0);
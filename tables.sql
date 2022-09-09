CREATE TABLE signatures(
    address VARCHAR(255) NOT NULL,
    player1Amount VARCHAR(255) NOT NULL,
    player2Amount VARCHAR(255) NOT NULL,
    gameID  INT NOT NULL,
    v       INT NOT NULL,
    r       VARCHAR(255) NOT NULL,
    s       VARCHAR(255) NOT NULL
);

CREATE TABLE signatures (
    gameid INT NOT NULL,
    amount TEXT NOT NULL,
    token TEXT NOT NULL,
    chainid INT NOT NULL,
    player TEXT NOT NULL,
    contract TEXT NOT NULL,
    v       INT NOT NULL,
    r       TEXT NOT NULL,
    s       TEXT NOT NULL
);

CREATE TABLE statistics(
    gameid  INT NOT NULL,
    player TEXT NOT NULL,
    token TEXT NOT NULL,
    contract TEXT NOT NULL,
    chainid INT NOT NULL,
    amount TEXT NOT NULL,
    kills  INT NOT NULL,
    deaths  INT NOT NULL,
    remainingRounds INT NOT NULL
);

CREATE TABLE leaderboard(
    player TEXT NOT NULL,
    games INT NOT NULL,
    wins INT NOT NULL,
    amountWon FLOAT NOT NULL,
    period INT NOT NULL,
    chainid INT NOT NULL,
    contract TEXT NOT NULL
);

CREATE TABLE utils(
    id INT NOT NULL,
    currentLeaderboardUpdate INT NOT NULL
);

INSERT INTO utils (id, currentleaderboardupdate) VALUES(0,0);

CREATE TABLE inventory(
    player TEXT NOT NULL,
    chainid INT NOT NULL,
    characterid INT,
    armor INT,
    weapon INT,
    boots INT
);

CREATE TABLE gamesproperties(
    gameid INT NOT NULL,
    chainid INT NOT NULL,
    map INT NOT NULL
);

CREATE TABLE armor_bonuses(
    id INT NOT NULL UNIQUE,
    health INT
);

CREATE TABLE boots_bonuses(
    id INT NOT NULL UNIQUE,
    speed INT,
    jump INT
);

CREATE TABLE weapon_bonuses(
    id INT NOT NULL UNIQUE,
    bullets INT,
    damage INT
);

INSERT INTO armor_bonuses(id, health) VALUES(0, 1);
INSERT INTO armor_bonuses(id, health) VALUES(1, 3);
INSERT INTO armor_bonuses(id, health) VALUES(2, 3);
INSERT INTO armor_bonuses(id, health) VALUES(3, 4);
INSERT INTO armor_bonuses(id, health) VALUES(4, 4);
INSERT INTO armor_bonuses(id, health) VALUES(5, 5);
INSERT INTO armor_bonuses(id, health) VALUES(6, 7);
INSERT INTO armor_bonuses(id, health) VALUES(7, 9);

INSERT INTO boots_bonuses(id, speed, jump) VALUES(0, 180, 25);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(1, 360, 50);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(2, 460, 75);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(3, 420, 110);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(4, 500, 180);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(5, 750, 80);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(6, 1000, 130);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(7, 777, 222);

INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(0, 1, 1);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(1, 1, 2);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(2, 2, 2);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(3, 2, 2);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(4, 2, 2);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(5, 4, 4);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(6, 4, 4);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(7, 5, 1);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(8, 4, 1);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(9, 6, -1);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(10, 6, -1);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(11, 7, 10);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(12, 8, 10);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(13, 9, 7);

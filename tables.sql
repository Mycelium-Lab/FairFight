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

CREATE TABLE players(
    player TEXT NOT NULL UNIQUE
);

INSERT INTO players(player) VALUES('0xf7c4bd295D9168879ff37431cd09Bdd470f75480');
INSERT INTO players(player) VALUES('0xd63dac78e1b3913779991a81cb1aa4eba74ca4fe');
INSERT INTO players(player) VALUES('0xae756b8946a2912d207f36e33a20fa02976ebb20');
INSERT INTO players(player) VALUES('0xfbf2dff529720b803007ff0b1e181160f5d17bda');
INSERT INTO players(player) VALUES('0x45d0d1a09509dc0c65ff9d4df0035fcea6a5ec62');
INSERT INTO players(player) VALUES('0x33ab855a59912a230cd812fd1cb796869b37fb72');
INSERT INTO players(player) VALUES('0x1a031637358876f3df9b394c79e3f9b4a9c96085');
INSERT INTO players(player) VALUES('0x025de75026d886c3265e039cfc7d681e11a49aaf');
INSERT INTO players(player) VALUES('0x14209c53039649e7e42279804fb14fa108bea962');
INSERT INTO players(player) VALUES('0xa1fb308038d1376fe53f3fab87d639f0d77e1dbb');
INSERT INTO players(player) VALUES('0x8faff9b78fec4d6d51dd020071a83a6098b12ab6');
INSERT INTO players(player) VALUES('0xb75e00e6d45dccfacf60376fabdf57845046ecf9');
INSERT INTO players(player) VALUES('0xfb2075f861d90248d2874d2446465605a7a85422');

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

INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(0, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(1, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(2, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(3, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(4, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(5, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(6, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(7, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(8, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(9, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(10, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(11, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(12, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(13, 9, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(14, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(15, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(16, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(17, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(18, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(19, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(20, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(21, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(22, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(23, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(24, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(25, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(26, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(27, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(28, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(29, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(30, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(31, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(32, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(33, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(34, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(35, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(36, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(37, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(38, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(39, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(40, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(41, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(42, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(43, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(44, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(45, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(46, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(47, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(48, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(49, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(50, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(51, 9, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(52, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(53, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(54, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(55, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(56, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(57, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(58, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(59, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(60, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(61, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(62, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(63, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(64, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(65, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(66, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(67, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(68, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(69, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(70, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(71, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(72, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(73, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(74, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(75, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(76, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(77, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(78, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(79, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(80, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(81, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(82, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(83, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(84, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(85, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(86, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(87, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(88, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(89, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(90, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(91, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(92, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(93, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(94, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(95, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(96, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(97, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(98, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(99, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(100, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(101, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(102, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(103, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(104, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(105, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(106, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(107, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(108, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(109, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(110, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(111, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(112, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(113, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(114, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(115, 6, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(116, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(117, 2, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(118, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(119, 1, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(120, 9, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(121, 9, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(122, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(123, 8, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(124, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(125, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(126, 7, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(127, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(128, 4, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(129, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(130, 3, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(131, 5, 0);
INSERT INTO weapon_bonuses(id, bullets, damage) VALUES(132, 9, 0);

CREATE TABLE lootbox_conditions (
    id              SERIAL PRIMARY KEY,
    description     TEXT
);

CREATE TABLE lootbox_signatures (
    player          TEXT NOT NULL,
    chainid         INT NOT NULL,
    condition_id    INT REFERENCES lootbox_conditions(id),
    random_number   INT NOT NULL,
    v               INT NOT NULL,
    r               TEXT NOT NULL,
    s               TEXT NOT NULL
);

INSERT INTO lootbox_conditions (description) VALUES('5 games played');
INSERT INTO lootbox_conditions (description) VALUES('Won 5 games in a row');
INSERT INTO lootbox_conditions (description) VALUES('100 kills');
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
insert into players(player) values('0xfb85e0d69e7a1cccbcec14e48c7505b4581cdada');
insert into players(player) values('0x2496de3990ce3b9b2f2dd8c1c146a2b2ffcb7d0b');
insert into players(player) values('0x4878f827a54b48b7869bbc27ea2d03a5abc3f4f9');
insert into players(player) values('0x9cce9428a597e9a52a555f47760f56ae0d7f8ef2');
insert into players(player) values('0x18b594a8fee1d7b657038c111c51b2bb18033002');
insert into players(player) values('0x77160b296084815d30b0e49069270ba17a33e7e7');
insert into players(player) values('0xf096102b8879469a95749807ce0ae1bed12beb9d');
insert into players(player) values('0x704880d88a45de1746361805cbf40039aa38e246');
insert into players(player) values('0x65b820f92003400b7a845286300f4660e4234214');
insert into players(player) values('0x28d1347bb5ae4dceeb2f77332b915f3b5af680f1');
insert into players(player) values('0x5e7d810946a4edde0bc757dec04836792106dc0c');
insert into players(player) values('0x4bf6b485a152c01332d346fcfb12d8989a3a32c1');
insert into players(player) values('0x9c85f122d962385aa36ab1607af317ef76a56456');
insert into players(player) values('0x5063b3af605285c4e7ef011a1cc5cb731f77cca9');
insert into players(player) values('0xef59c8427845bcad378fa28ad2cb11e2cca637a6');
insert into players(player) values('0x29251c216cc908e3936a35555e94d6b1524205a6');
insert into players(player) values('0x50269d383bf84a95697e39454dd94f3b6eca7140');
insert into players(player) values('0xc038ce7c08e0e2d0a8a06effcb8985275210e6d6');
insert into players(player) values('0x0e5abd7030b517c2ec01caabfc3a1e6e68394050');
insert into players(player) values('0x4a78b726cfde00269a80a8a23ab5c8a5763a0b26');
insert into players(player) values('0xaa3a92977559c334571181df1a7a77b4235c614f');

insert into players(player) values('0x4e3f2a59608dd6c4e8c8bc46a7e52901b646a802');
insert into players(player) values('0x5f5ce5db34a7e8444d2b529b3435d2246424f5f8');
insert into players(player) values('0xd313281516f95a368b362952d1da6abf0b97b983');
insert into players(player) values('0x00f735cf97077baaa31f8c14dbe30fe9aebbaea4');
insert into players(player) values('0x52673fa45a336e7d538cf45603f242e8dcc82a85');
insert into players(player) values('0xeddf25151232b110fa1d6b505713be0a2a138e0b');
insert into players(player) values('0x274e86003958103e450b5641335eb3266a776af1');
insert into players(player) values('0x701285effc97096f2bf5472e45656747add8a8f1');
insert into players(player) values('0x751b3a78a6edf5d718f17f96d79f9bb079298760');
insert into players(player) values('0x6668162fd22787c396fee016c0696a0da3b1e554');

insert into players(player) values('0x92c1a6016aa5d6edaa6315994dd07f3a3034b8b7');
insert into players(player) values('0x9c63be25e77dee6b3472717fcb8318eb09f8ea61');
insert into players(player) values('0x8d3f0d38412cf0e3001d86203969764a082697af');
insert into players(player) values('0x8cd671a03ca69be4be368094f6bd8a37e09748f9');
insert into players(player) values('0x0158a2338f2f09fe91df111c79202c7bb8018930');
insert into players(player) values('0xccddffedef80b037bffdaeb0c8002372a482d5e2');
insert into players(player) values('0x21e5f0b40096b4145ac9255a2cfb876bc0e80469');
insert into players(player) values('0xf4e30384b543ccf9dddd870f086c0c17229ab216');
insert into players(player) values('0x28295c3d24d3d972d45013d86a58d690f96a192f');
insert into players(player) values('0x2c8272f7e520679340157e079e0f296aec3033b3');
insert into players(player) values('0x30cd63bab564eb5189223bd866afac174d40ba01');
insert into players(player) values('0xc94688235cddc2c2eb328e7f61d016e75ef43bf5');
insert into players(player) values('0x264ac44e857280b98091233f82066ace8d5580bb');

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
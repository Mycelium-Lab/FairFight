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
    contract TEXT NOT NULL,
    kills INT NOT NULL,
    deaths INT NOT NULL
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

insert into players(player) values('0xf7c4bd295d9168879ff37431cd09bdd470f75480');
insert into players(player) values('0xd63dac78e1b3913779991a81cb1aa4eba74ca4fe');
insert into players(player) values('0xae756b8946a2912d207f36e33a20fa02976ebb20');
insert into players(player) values('0xfbf2dff529720b803007ff0b1e181160f5d17bda');
insert into players(player) values('0x45d0d1a09509dc0c65ff9d4df0035fcea6a5ec62');
insert into players(player) values('0x33ab855a59912a230cd812fd1cb796869b37fb72');
insert into players(player) values('0x1a031637358876f3df9b394c79e3f9b4a9c96085');
insert into players(player) values('0x025de75026d886c3265e039cfc7d681e11a49aaf');
insert into players(player) values('0x14209c53039649e7e42279804fb14fa108bea962');
insert into players(player) values('0xa1fb308038d1376fe53f3fab87d639f0d77e1dbb');
insert into players(player) values('0x8faff9b78fec4d6d51dd020071a83a6098b12ab6');
insert into players(player) values('0xb75e00e6d45dccfacf60376fabdf57845046ecf9');
insert into players(player) values('0xfb2075f861d90248d2874d2446465605a7a85422');
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
insert into players(player) values('0xa00c1ececa25284822f2aa984387f6debda39628');
insert into players(player) values('0xda721b1966c7cd2bce71a4eec95ac41b4531a52d');
insert into players(player) values('0x8947b9b5dbb733dc6b6f527a7b04250a2247097e');
insert into players(player) values('0x1194162504aaa1971e41685d82e155cf8681dad0');
insert into players(player) values('0x111e355eb9533e1efb79e9b275257b51a80b0a71');
insert into players(player) values('0xef8f5124d2e50fb3dc6481361a6da6110564e072');
insert into players(player) values('0xc532f47939385ac9da16de085bdb79838938b6b4');
insert into players(player) values('0xe24cad15e34ef046510832fa98707e04193106c8');
insert into players(player) values('0x30bdbc72308311d8c0102d9d0a3f9e12664acd24');
insert into players(player) values('0x4ff1f246ceaf366dfcfd1fdd5163470fc79dc8ad');
insert into players(player) values('0x93bf4aa2a8aa3d7cb2e72dc42dd4cfd532695515');
insert into players(player) values('0xaa82256f672a6f007d79e1505860117a4b9c596a');
insert into players(player) values('0x8e704c8a3e3641d7c037aceddc925107a2dc6138');
insert into players(player) values('0x3b9f45458fd9edb2f503c837a2bc5c87d976eef1');
insert into players(player) values('0xeff5a9a29ef9a83f155837a724f3264d812cd1b0');
insert into players(player) values('0xcbf8184dba6058ea0444a54bdc7cbebbfe81ac0e');
insert into players(player) values('0x4bff4fbb1f8ef9dd0871af671537f693430fee7e');
insert into players(player) values('0x04c782076a0af9610a2fa3d742db5dd52e052dd9');
insert into players(player) values('0x3e2de4c75fd3f0085e32020ffa554e8902a2cfdc');
insert into players(player) values('0x4f43be769a8f2c05a8563abe18a9313136e0807e');
insert into players(player) values('0x857f88e0347fbc1c9f03e6ea458bad8c09cd8a54');
insert into players(player) values('0xb74febf1677b77addc29497087222d1f7420b3f7');
insert into players(player) values('0xb168c9069fed11e177ca6b94e1d7d663b65922da');
insert into players(player) values('0xe1c2d81ac574bba7a03e997bf9b8e3ffa342d80c');
insert into players(player) values('0x5490e47a4e50309a1ee03a12bf5bb862e028cde4');
insert into players(player) values('0x67d347884719b38ac1f3f7eba692aa198ef8f24d');
insert into players(player) values('0x439e78fda08c1260811289cfa5ab09b7933f5a3f');
insert into players(player) values('0xc8c75713776bd20fa59ed9b03b1d30b3b8d24311');
insert into players(player) values('0x62def8ea2c680ecf937cc4cb391bbd266a8405cb');
insert into players(player) values('0xc109241b3eefd459445011f674de410fbbe89681');
insert into players(player) values('0xbdd1459d95f9e0d4c9ef91cb7eb2b8a0a35c78a2');
insert into players(player) values('0x59fe4f301d69462ab914883c12a7b946d8ecced3');
insert into players(player) values('0x18a77f5f216a5637358027e00c3153e196f17ca8');
insert into players(player) values('0x6e20babe71ff35b9868d0f0dc97225d920d90d68');
insert into players(player) values('0xfbb165d7ac6f27c40d21564261ed416a3b246bbc');
insert into players(player) values('0x43dc3c06842bad370ec66c9a8f74a2e0da466edc');
insert into players(player) values('0x7d37f8f72838d2e82d7e46850e2b57734840edb8');
insert into players(player) values('0x81bdf0ec8bca3bb0268bd1f82d04e8ac1293943a');
insert into players(player) values('0x6f039285f86a4b7bdad82c2243de6d08912ceefb');
insert into players(player) values('0xafc3be1aa0b860653afa4b61f0c2a0c015fce5c3');
insert into players(player) values('0x52efab9b9bc406878b0b8db50985b41749d0f324');
insert into players(player) values('0x926574fa572c8e647880649266d26ef5131f5a10');
insert into players(player) values('0x5bed7d78b2a79949b8ccba31b038edc40b60fbd9');
insert into players(player) values('0x1fa65353b40c1cb027ad6a8d18885ed737e19add');
insert into players(player) values('0x4329a52c9e0ad7e99208eaa2329e092d750c4af7');
insert into players(player) values('0xdbbd07e5877e9a4327d2e43ebb8411c91afbb575');
insert into players(player) values('0x87bfe4eb097169014bbf03b0b4b29b4c3242437a');
insert into players(player) values('0xbc46036d104ab873594f627b5c0b82a6569e331d');
insert into players(player) values('0x675b737516b040300465eda0347578bcd025e58c');
insert into players(player) values('0xf2fd50f832855675487c439330eb61c4ed74f826');
insert into players(player) values('0xc46c9fd4bd06aab51f7fcf5388401a3b96101e61');
insert into players(player) values('0xfa32eb84dc1843da6f460c5f3fd4a1e6e62a3304');
insert into players(player) values('0xa9041b18b8599a5b26c7f0d911b8825b76d7c720');
insert into players(player) values('0xdaa0d194aca2e8249e7794d48117834c15a502d6');
insert into players(player) values('0x60be1045677dc43f62b62dd176b4a10aec308070');
insert into players(player) values('0xe24e53e8a51f7f250f485b3d7804d0a12ce65368');
insert into players(player) values('0x48bbf752fe830541ec8235a2c9b219de22ed0de3');
insert into players(player) values('0x09fad1f0e8b31ecc1109322a060336a887e31a80');
insert into players(player) values('0xa911df08a7f868d3b0b865d825960705c4732c7a');
insert into players(player) values('0xe64923d1205408752271a0fa6828001e391a7b5e');
insert into players(player) values('0x817979d014264a7a99562ddbb88e0765b8eb657b');
insert into players(player) values('0x96cc40d4401b22abc3b80a315a12505a5d156b0a');
insert into players(player) values('0x73c46dc9f39b11a861400edd35c0a8f45f3134cb');
insert into players(player) values('0x3cc40343ea58ceaa3a47d8abd5863618fdbf0c03');
insert into players(player) values('0x4a5b2e467fa3eccea5d9c48b58277e9e6ddaf981');
insert into players(player) values('0xa9404c6da65cb011ee4e7c43c3e97a1bbe841517');
insert into players(player) values('0xf3725e397567657118e3fd820657d935bb680142');
insert into players(player) values('0x7f52ea814433d3c412e0ba7c1b5e2d61188948db');
insert into players(player) values('0xe643c554ebc846f98c5f03ac121e1bbdf9b513a9');
insert into players(player) values('0xeeb67026562b96cc91ba629e02d7f62b4a19e118');
insert into players(player) values('0x8ea87108767b38ac14b05051d5526e5403e2f279');
insert into players(player) values('0x7579794f386795beb3fd01b926b684fb57b0f2b7');
insert into players(player) values('0xa0d7b69bbf4b56558daa61eb96e2bbeb980c2d2b');
insert into players(player) values('0xe5b714f7691517ee832069313aaaefa5d05bc104');
insert into players(player) values('0x6fc597810dedc6e044400d6d73165e9dbc6407c8');
insert into players(player) values('0xb7ef06af5150ef5fb42a2fdfa0b292393895e15f');
insert into players(player) values('0xe53b0e45d84d6eebfe54b4a2adf6c136486d6ae1');
insert into players(player) values('0xe60d82f626d2bb4484c9022843d3f7143a6a1971');
insert into players(player) values('0x746c024af07886be160e6c00a2e95f9453ee716f');
insert into players(player) values('0xcc27650cbb8a8fb3ecbe7302873b52ad21dddd65');
insert into players(player) values('0x7f9116f43183694a29555881265b2e6019159a6b');
insert into players(player) values('0x9f40871c89cf43530481ea8f1cc29157cf2a1464');
insert into players(player) values('0x1f2adf6ef169f960b575dc83dba5af53338d85c0');
insert into players(player) values('0x72a5a9f7a578a0a2b0bba280440cbddf14413db1');
insert into players(player) values('0xc160e052ae2b7b6098d77ee0b36593bdfcd46f71');
insert into players(player) values('0x842013360b0bfc78ec5d5fc1907be5c772c95ea2');
insert into players(player) values('0x9ed68c643f2a1fc0d34fa478ad0c5289a0864769');
insert into players(player) values('0x117b443028a06a6c806c002a52659c6dd1403d6e');
insert into players(player) values('0xab2b72939555579653876e8cd1c1b72417d9782b');
insert into players(player) values('0xe20c7ce5bb8021eb33aa8492cd14e9d1194c9748');
insert into players(player) values('0x83fe7b791e7db1539aff74b1f5a81bc3199f859c');
insert into players(player) values('0x5ef3367bdd4e14687e906217de0f27541057deeb');
insert into players(player) values('0x2f74a22b652bf414dacc43b73ed8897dcf639140');
insert into players(player) values('0x23dcb022b2608b42c3d14a4e587066ed993f1a93');
insert into players(player) values('0x01548e209d2dfa7e1e4d06022e1f8a590b57af86');
insert into players(player) values('0x63f50938aa46ac405d1322975cfa293c45365cea');
insert into players(player) values('0x550644df222caaf68d5792efda43720c6f26657b');
insert into players(player) values('0x05dc6a70fcace5f9e17abd6ad28be9b76cc60870');
insert into players(player) values('0x82c0c77ea23b8228bab865cf87ad9a0327129f46');
insert into players(player) values('0xcf9ab65b9c02d91fa92f4b6ea8ad80b284922769');
insert into players(player) values('0xe81e55c408fdfad2944d750b614faad82dc83417');
insert into players(player) values('0x3dd3ac72438c2024b14820c68609256b409621c0');
insert into players(player) values('0x226aa908258c90584f99a654e8b9050ed91b5da2');
insert into players(player) values('0x0d78dce3bbc4dbf1fe9f5dc8eb83681c776442f1');
insert into players(player) values('0xd14a19d758554a0ae3775ab25e19507d32b22bd0');
insert into players(player) values('0x044e546bc7da01186e484c0b06fff06675d4be0a');
insert into players(player) values('0x95b3e93688409c6b198bf7761e338ce284bbdd11');
insert into players(player) values('0xae1949d95572ed89394c52ff40294bc25a2ba948');
insert into players(player) values('0x959e9e7628402864d1f2051dc420c84481cc1e73');
insert into players(player) values('0x64b2974a0233722bfa2e103b26a7a0145053bb62');
insert into players(player) values('0x73b79016381712d47add9a34fd0042ecec43bb49');
insert into players(player) values('0x767da058c16a1b2fa7a01f0588f4f2150cc45bc7');
insert into players(player) values('0xb57eee512afb6671a636a85dc680c710490a7c2e');
insert into players(player) values('0x08e48736028616bb749effc148dcee8ab8271b7e');
insert into players(player) values('0xd45c8df26f9a65b254bc4c3ef8ba0be576c230e3');
insert into players(player) values('0x8e58096099cc1eed65509b9d2edb090bc1c8655f');
insert into players(player) values('0x6e3bd507c94900df48cbdaf0a0aef315f13cd3d8');
insert into players(player) values('0xf37a438737fa9a959730d0b93ed0ca0df2512639');
insert into players(player) values('0x56f05162d97a08eafdc07820df95f529409421c0');
insert into players(player) values('0x359a857f6fa3aa561860c2c27ad2f75bad49cb08');
insert into players(player) values('0xef8deb9e93a35f4f8f41342e471179bddbd7cb65');
insert into players(player) values('0x8348650ddbed57434c740513d58803a28598d093');
insert into players(player) values('0x21b5ad6796b64b8a074b7cbc70b1f77d95512538');
insert into players(player) values('0x554ec9fcedfdd7736a391a277aa825cdf7267466');
insert into players(player) values('0x250eebe453051d94a7045a989a76e57d6db323d3');
insert into players(player) values('0x3729d1f241a9482f47d23ba92117add095d01c40');
insert into players(player) values('0xc9fb5d60fb88e640b694f4a4e821d902b8d5cdef');
insert into players(player) values('0x3c13ee5d2854289c95d2423a30e0aebcb051d562');
insert into players(player) values('0x3a07e38f2f0f1c906c3c0e95b2ff9a31df5a63e1');
insert into players(player) values('0x5d4613e1f0f33d1e5a9b10a48b8ba54ff3f0decc');
insert into players(player) values('0xb0d6d939371ac790cdb1e65726e4bc98a824dc38');
insert into players(player) values('0x708b25e8f390eb1e05eeb2d83606816026408704');
insert into players(player) values('0xd87baeef6ccbe5317681852a479ae7fb6c4db33a');
insert into players(player) values('0x5dc04c8c53671ec69938a3334f554fd485fa6542');
insert into players(player) values('0xeae8f8425f3efd2419be534d2430730be6cf9b3b');
insert into players(player) values('0xfe7d7ecc8e4e09dc98266d2fadd63e01d657b4c8');
insert into players(player) values('0x594db3bf65afe8dd417962fa3688d1a0dfa5f789');
insert into players(player) values('0x0457c43b563daa9f5ff8110b7d4209f5ca8cf09d');
insert into players(player) values('0x6f2be5433acd9682c13914e4353c84c732b32f4e');
insert into players(player) values('0x8fe5331fc700daabab83575dd9616e1bca563e1e');
insert into players(player) values('0x3cbaae000632974fae2c385c38fb4d8666f64321');
insert into players(player) values('0x8c5f206d4c56cca3258bbe8c3a86ac3334ad0f35');
insert into players(player) values('0x8bdf6cf4b00d2700e765a9e25e9497b5895fbb60');
insert into players(player) values('0x792c01f0e938bd8ad708b1564bf178ab591e9893');
insert into players(player) values('0x9280685182a54fb16f4a67a8015065ab00768eae');
insert into players(player) values('0x0f62b2d32673a93183fb1a685518d6968c1ced61');
insert into players(player) values('0x66d5940a474b00393152a21dcb9deb5fb54be51d');
insert into players(player) values('0xabe3b7208ae63aa6acf8a509a4b7e6eaa44dc575');
insert into players(player) values('0x384b2f7888a4bd88d13b4fb8fd4163b484ab6b13');
insert into players(player) values('0xfd433e63a1ffec06fe3891a8c7e2109c0d91552e');
insert into players(player) values('0x14fab376de6e97ab67c9228243cf3e7de133a1be');
insert into players(player) values('0x0ce0da8a9c14b24737e8511775d089e4aba3f7ec');
insert into players(player) values('0xc46dfb601eb16481ea831117bbab18980a45a926');
insert into players(player) values('0x8594d26aa2d0d53c360d70a0b19421aa486d7b31');
insert into players(player) values('0xc447ac42283c0a02f68b3f39277f94e326e709e4');
insert into players(player) values('0xf5e03ff610be93f7317928925c2bfa5d001cd263');
insert into players(player) values('0x5e5e5bf4197608f6765adff495d93dd86a8909f8');
insert into players(player) values('0xabc09034786dca2bde3ff160e918379bd6555a60');
insert into players(player) values('0x26beb48e41686cf67f4bdab164c60ee56dea96e0');
insert into players(player) values('0x4315125de94574ca1277d26afd77b87a23121641');
insert into players(player) values('0x7dd122fcd1cb0ad7469533c8737d117f2cd30b7d');
insert into players(player) values('0xe454146775b83679b4038aaf423795756ba43ee5');
insert into players(player) values('0x2cbec8b48b8a5db5d618671780dac877c94a6397');
insert into players(player) values('0x98719055a675588a4922bab4ac544ed81c66bace');
insert into players(player) values('0x939145098c9fe63e4607662492633ad60ec52f09');
insert into players(player) values('0x20076ddf28ec932751787b5e72cf307606822c0b');
insert into players(player) values('0x7f77d7842e0aa222b41d6aaee6d23c36021c9f2a');
insert into players(player) values('0xb1948d1a304a70667fc65840cb75a16c0fd06a02');
insert into players(player) values('0x2373a85a950afd1a56471ff609b8bdd32291b73d');
insert into players(player) values('0x0bf7b742ef60378847700b1becc51caee9c4bbbc');
insert into players(player) values('0x79d63cc608e33d84e902776684e13650b2c2765c');
insert into players(player) values('0x4af11b3eb3b8ac1dc818c28baceb399532728b9c');
insert into players(player) values('0x75237981aa21120712b63a923ac7e53befeec26c');
insert into players(player) values('0x2d299ade24e8fdd55ac834b62853f8edd61eeef7');
insert into players(player) values('0x16744fbf624b2a2918146d52490c4c658271e38a');
insert into players(player) values('0xbeacf90bba98087600149ef60a4338b714d5a3ce');
insert into players(player) values('0x7212189abe6cf971aace207d975c5ab7d40b5579');
insert into players(player) values('0xb35dc0e49c120cf00f8b4712f2a9f50782ccd398');
insert into players(player) values('0x53c45709de655ba54cec43879bb12c4a79fd9484');
insert into players(player) values('0x5cb5fe0c00d04faf64350cf3fc597215b26d02df');
insert into players(player) values('0x7a70684f572faee3960a54009bc5efe956e7148c');
insert into players(player) values('0x0c30d8510ba88d74e3b683c9de17baeb8642aeda');
insert into players(player) values('0xda7a9a2d9eeaab34c60f476c1e001d353b81af4a');
insert into players(player) values('0x41deeed8d036ed9ab3015f4f2c3030f007d6b947');
insert into players(player) values('0x2b4bedd99f126d7d51ab63f8a8232d059a4c32a4');
insert into players(player) values('0xf72a39d0e1f4e9d9462cbed78d7c875d9cef153c');
insert into players(player) values('0x6f6eb65cbda2344ca54cf2e3c8841aa232bc16a3');
insert into players(player) values('0x5ba9935b0f36681f1d385c8c17c4e9927cc8a39a');
insert into players(player) values('0x86aff6a4a05867b851294189aacebba4cdae6f4a');
insert into players(player) values('0xb3f25df1c781af3c3853140cad849764ebaeabf5');
insert into players(player) values('0xfd9986f181fee05554fb96e726c9ef7a4bac0b15');
insert into players(player) values('0xd289d047555298f67b3e1b5db6c43e1e58ba9cc3');
insert into players(player) values('0x8744ef397658dd16ee0dfdc6a163fdd3557934dd');
insert into players(player) values('0x3105a2c3e3411d4997279b0e76e4b936a06c87c3');
insert into players(player) values('0xd615c615f273b569e406c6c15fc90211223dff0a');
insert into players(player) values('0x6f1995ee837a87136483d8e4360a77556fa7ca9f');
insert into players(player) values('0xa718d5e85429c1c44da955523d5fef1c80204827');
insert into players(player) values('0x8ed9906a722bb4c34a99655bc6ac4331c477f355');
insert into players(player) values('0x920b0b8b6f8ed4c714e55471a123a23d8b6f438e');
insert into players(player) values('0xa7496c9be36ea699bb0465d9f8f25a2d0820e4d5');
insert into players(player) values('0x85f65f307bd9626581e5b686dd1b317de567db66');
insert into players(player) values('0x9c1c0b2588a635e4fd7a8edb5d2cec69db7ff1c9');
insert into players(player) values('0x876e13fa4c484747779dd73514573f34f9e21e5e');
insert into players(player) values('0x56af242fa412be9e6c9ec309ee0fc33d65759fe9');
insert into players(player) values('0x73aa697f713a83d19a4cef43c772ac7cbb847d7c');
insert into players(player) values('0x8f46f6c7936f6994254e183f91a23d992c340fa4');
insert into players(player) values('0x5d5d33757016f1a44667123cd5384a5ce53f2514');
insert into players(player) values('0xcfa5b83f4b1b56e0904fd47f434497efb174c793');
insert into players(player) values('0x611ba16195e455b4c80a3d087ff940f581f4769b');
insert into players(player) values('0x1f2f2fcde25a685a89cb3ca0fba458e04f5e9f79');
insert into players(player) values('0x7005f7b87e6145465be2efdec7ee9df86809e3bd');
insert into players(player) values('0x1b6b85c0a3902a0b1ed799c8d1b584d9c23bcc25');
insert into players(player) values('0x1914d8df5b2b6aa569156d7fbe478ae67f289d0e');
insert into players(player) values('0x7367e4e3756b36783beb3f1c6becabd4083f737c');
insert into players(player) values('0x51b3e5b0f80bf5d8b19d87b56efd6add2a47d6d2');
insert into players(player) values('0x871a25a60a3f1be57ee4aad9b095851776261678');
insert into players(player) values('0x7bc0ec5a8f43da964908e79cffc325f77090cedf');
insert into players(player) values('0xcd19be7c9c2ed602a128ea7065ea12f1b06af7b5');
insert into players(player) values('0x98edbc8b4c0e85c0cb4e4a6d3950ff15b7f2ae66');
insert into players(player) values('0x78c0e6bf2658b5295592a607a507d03925196433');
insert into players(player) values('0x2d55c6f9a3201082787ce64b78986b68cdf97093');
insert into players(player) values('0xed45e0a13d05107224aa80088d88edfb4a8833fc');
insert into players(player) values('0xdb32e4e2437e62086fc77744977dccfe53b09561');
insert into players(player) values('0xf1cf2312f07e092da1fe87dd7e4a27cc2fadd904');
insert into players(player) values('0x6f36b7bbfa990ef34ba270a1e19040f9e0ce48ad');
insert into players(player) values('0x2d698a83cd73f415248f001c0b91c3637c493bff');
insert into players(player) values('0x46522341536c29a234bc4477f96e3dc95cb621cb');
insert into players(player) values('0xccbcb121bc6b3c4bf8c4c2c3bccb3bd446da3729');
insert into players(player) values('0x0ea2a71895f0c1a25bf02ee430ce15384a3d673c');
insert into players(player) values('0x9ebced74a90a0efb3d5874814f340afb205abe39');
insert into players(player) values('0x848d81635f8536c3329e29410d71baae55e27980');
insert into players(player) values('0xdf7d54e62a5f6938274b48eafd19d46dc1847200');
insert into players(player) values('0xcfe15a1ff9f59987933c7becf269a3d7b997fad0');
insert into players(player) values('0xb4115fd6d8f58f629bbc53edbbf752badd202292');
insert into players(player) values('0x171d5b23257253537a817bd31a1ec275ba94ea9a');
insert into players(player) values('0xd750cb72c6fbac75a21e37d2c12f2380e6183d2a');
insert into players(player) values('0x620494481022c10758fc5cf426ab9c0e8a449b69');
insert into players(player) values('0xca719ae60b653dcd5bf26c12c8783cc3bd4c4fc5');
insert into players(player) values('0xda8114214208a091a91660b79c5ff71642243c5b');
insert into players(player) values('0xfe6eecdd68de9b6edd772f5582cc0662faecc436');
insert into players(player) values('0x2063f2533984e76c5260f0f027dc52566bd882af');
insert into players(player) values('0xcd8c3bc89a546d104204cb6f278db6e13b1bdd64');
insert into players(player) values('0x10ab6e11ae84d9de8d1a31e346dc328f7247703c');
insert into players(player) values('0x4a1e9a867a31556d456a83236a56d6df3e60f301');
insert into players(player) values('0x627d2ef3dc2004df3a771040e7db2893a3618024');
insert into players(player) values('0x71db7f6535cd502a2a3af21f8bc5cd7305f17e69');
insert into players(player) values('0xfde12b413948ee3916c87b3c1c507ba72ab4802a');
insert into players(player) values('0xd28352e446a7d4845ff3adea3e5b4d0db16f194a');
insert into players(player) values('0xa92cd18775096772f6277d8cb8580d7f1f140e0b');
insert into players(player) values('0x4a7028ea43b28c21cc0a986944f371e158286b14');
insert into players(player) values('0x4ab5f09791c27a63d26bd0057c72d688fcf00430');
insert into players(player) values('0x7231c19a3c07182bb10d0fffafd98cb287736d42');
insert into players(player) values('0xdb99e4af73c70323784bf2428da724612b279639');
insert into players(player) values('0x8e98b2c84c54f50e2f8db5b1efc7afb3d7156f0f');
insert into players(player) values('0x792486659c39fd918b8728e8be8e305694c285d2');
insert into players(player) values('0xae67b77c28f4f280e2440ed1fad1e1ce7bc96ca2');
insert into players(player) values('0xffccbabc16b9701d4c9b80e0f8fdc4a6d5999992');
insert into players(player) values('0xf0238c72106bb62f428b4edffddfee8029cafd48');
insert into players(player) values('0x18d9172a74f02a4e3005c5b58f6167db65b5d152');
insert into players(player) values('0x0f5bb2bd764246eaa5fabefaf23b36be4f36bc53');
insert into players(player) values('0x5b775965d207e16879ed36e47ca6dbf28b7b95c8');
insert into players(player) values('0xa82b59bc5dacf3c7752568859f63d7d266809f2e');
insert into players(player) values('0xc13e812cf97830022ed2ad3c0ad9b63ec9169159');
insert into players(player) values('0xa3345161e26f482938c89c7a8c612ebcd0f98b92');
insert into players(player) values('0xf9e8ecb3a30ded510846ae39a42d7eff464fe64d');
insert into players(player) values('0xd7b8699670b639736f54d1e54b1f9a3e2250be61');
insert into players(player) values('0xf596c3ed02c257434c4a3cb57980063ad7def725');
insert into players(player) values('0xd0e7711c95fc8326ff68c436ca057070608438db');

insert into players(player) values('0xCaEC4F9a5c844dC5FDd9fc6De391948Af1B648f6');
insert into players(player) values('0xc58082cA3B17d97F1eC6AA2a5Fb8e736d3A7B921');
insert into players(player) values('0xE387802E524705B68e91bBD5BF32C3525329dC2F');
insert into players(player) values('0x1A5e0f2d10cc9f9010096fd1B2Fcf33ccE534217');
insert into players(player) values('0xB741E94BaF65e50B0033cF85f751C073558C2251');
insert into players(player) values('0x7A83816196F7A9657908f9828128fB3285aCf035');

INSERT INTO armor_bonuses(id, health) VALUES(0, 1);
INSERT INTO armor_bonuses(id, health) VALUES(1, 3);
INSERT INTO armor_bonuses(id, health) VALUES(2, 3);
INSERT INTO armor_bonuses(id, health) VALUES(3, 4);
INSERT INTO armor_bonuses(id, health) VALUES(4, 4);
INSERT INTO armor_bonuses(id, health) VALUES(5, 5);
INSERT INTO armor_bonuses(id, health) VALUES(6, 7);
INSERT INTO armor_bonuses(id, health) VALUES(7, 9);
INSERT INTO armor_bonuses(id, health) VALUES(8, 3);
INSERT INTO armor_bonuses(id, health) VALUES(9, 3);
INSERT INTO armor_bonuses(id, health) VALUES(10, 4);
INSERT INTO armor_bonuses(id, health) VALUES(11, 4);
INSERT INTO armor_bonuses(id, health) VALUES(12, 2);
INSERT INTO armor_bonuses(id, health) VALUES(13, 2);
INSERT INTO armor_bonuses(id, health) VALUES(14, 3);
INSERT INTO armor_bonuses(id, health) VALUES(15, 3);
INSERT INTO armor_bonuses(id, health) VALUES(16, 7);
INSERT INTO armor_bonuses(id, health) VALUES(17, 2);
INSERT INTO armor_bonuses(id, health) VALUES(18, 4);
INSERT INTO armor_bonuses(id, health) VALUES(19, 6);
INSERT INTO armor_bonuses(id, health) VALUES(20, 6);
INSERT INTO armor_bonuses(id, health) VALUES(21, 2);
INSERT INTO armor_bonuses(id, health) VALUES(22, 1);
INSERT INTO armor_bonuses(id, health) VALUES(23, 7);
INSERT INTO armor_bonuses(id, health) VALUES(24, 7);
INSERT INTO armor_bonuses(id, health) VALUES(25, 2);
INSERT INTO armor_bonuses(id, health) VALUES(26, 8);
INSERT INTO armor_bonuses(id, health) VALUES(27, 1);
INSERT INTO armor_bonuses(id, health) VALUES(28, 5);
INSERT INTO armor_bonuses(id, health) VALUES(29, 2);
INSERT INTO armor_bonuses(id, health) VALUES(30, 5);
INSERT INTO armor_bonuses(id, health) VALUES(31, 8);
INSERT INTO armor_bonuses(id, health) VALUES(32, 9);

INSERT INTO boots_bonuses(id, speed, jump) VALUES(0, 180, 25);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(1, 360, 50);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(2, 460, 75);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(3, 420, 110);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(4, 500, 180);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(5, 750, 80);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(6, 1000, 130);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(7, 777, 222);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(8, 180, 30);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(9, 520, 180);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(10, 150, 100);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(11, 800, 220);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(12, 290, 110);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(13, 450, 170);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(14, 290, 90);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(15, 810, 210);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(16, 810, 200);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(17, 800, 200);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(18, 790, 180);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(19, 280, 110);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(20, 280, 110);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(21, 300, 100);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(22, 120, 85);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(23, 130, 80);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(24, 150, 70);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(25, 190, 90);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(26, 600, 120);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(27, 600, 250);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(28, 500, 170);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(29, 790, 200);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(30, 300, 90);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(31, 100, 70);
INSERT INTO boots_bonuses(id, speed, jump) VALUES(32, 550, 140);

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

ALTER TABLE statistics
ADD COLUMN finishTime BIGINT,
ADD COLUMN rounds INT,
ADD COLUMN amountPerRound TEXT,
ADD COLUMN baseAmount TEXT;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE game_f2p (
    gameid          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner           TEXT NOT NULL,
    map             INT NOT NULL,
    rounds          INT NOT NULL,
    baseAmount      TEXT NOT NULL,
    amountPerRound  TEXT NOT NULL,
    players         INT NOT NULL,
    createTime      BIGINT NOT NULL,
    finishTime      BIGINT
);

CREATE TABLE players_f2p (
    gameid          UUID REFERENCES game_f2p(gameid),
    player          TEXT NOT NULL
);

CREATE TABLE statistics_f2p (
    gameid  UUID PRIMARY KEY,
    player  TEXT NOT NULL,
    amount  TEXT NOT NULL,
    kills   INT NOT NULL,
    deaths  INT NOT NULL,
    remainingRounds INT NOT NULL
);

CREATE TABLE board_f2p (
    player      TEXT NOT NULL,
    games       INT NOT NULL,
    wins        INT NOT NULL,
    amountWon   FLOAT NOT NULL,
    tokens      BIGINT
);
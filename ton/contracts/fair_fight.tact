import "@stdlib/deploy";
import "@stdlib/ownable";

message FightMsg {
    amountPerRound:         Int as coins;
    rounds:                 Int;
    maxPlayersAmount:       Int;
}
message Join { id: Int; }
message Withdraw { id: Int; }

message FinishData {
    id: Int;
    address: Address;
    contract: Address;
    amount: Int as coins;
}

message Finish { 
    data: FinishData; 
    signature: Slice;
}

message FightJoin {
    id: Int;
    joiner: Address;
}

message ChangeSignerPublicKey {
    signerPublicKey: Int;
}

message ChangeFee {
    fee: Int;
}

message ChangeFeeCollector {
    feeCollector: Address;
}

message ChangeMaxPlayersAmount {
    maxPlayers: Int;
}

message ChangeMaxRoundsAmount {
    maxRounds: Int;
}

message ChangeMinAmountPerRound {
    minAmountPerRound: Int;
}

struct Fight {
    id:                     Int;
    owner:                  Address;
    createTime:             Int;
    finishTime:             Int;
    baseAmount:             Int as coins;
    amountPerRound:         Int as coins;
    rounds:                 Int;
    maxPlayersAmount:       Int;
    players:                map<Int, Address>;
    playersCurrentLength:   Int;
    playersClaimed:         map<Address, Bool>;
    escrowed:               Int as coins;
    paidOut:                Int as coins;
}

struct Fee {
    amount: Int as coins;
    fee: Int as coins;
}

contract FairFight with Deployable, OwnableTransferable {

    owner:  Address;
    signerPublicKey: Int;
    feeCollector: Address;
    fee: Int as coins;
    maxPlayers: Int;
    maxRounds: Int;
    // /// @notice Contains minimum token amount allowed for one round. Also if equals 0 means that token not allowed.
    minAmountPerRound: Int as coins;
    // /// @notice Shoes if player currently busy.
    // /// @dev Player cant have more than one game in a moment.
    currentPlayerFight: map<Address, Int>;

    fullFightsLength: Int = 0;
    currentFightsLength: Int = 0;
    currentFights: map<Int, Fight>;

    init(
        owner: Address, 
        signerPublicKey: Int, 
        feeCollector: Address, 
        fee: Int, 
        maxPlayers: Int, 
        maxRounds: Int,
        minAmountPerRound: Int
    ) {
        self.owner = owner;
        self.signerPublicKey = signerPublicKey;
        self.feeCollector = feeCollector;
        self.fee = fee;
        self.maxPlayers = maxPlayers;
        self.maxRounds = maxRounds;
        self.minAmountPerRound = minAmountPerRound;
    }

    receive(fightMsg: FightMsg) {
        self.create(fightMsg);
    }

    receive(msg: Join) {
        self.join(msg.id);
    }

    receive(msg: Withdraw) {
        self.withdraw(msg.id);
    }

    receive(msg: Finish) {
        self.finish(msg);
    }

    receive(msg: ChangeSignerPublicKey) {
        self.requireOwner();
        self.signerPublicKey = msg.signerPublicKey
    }

    receive(msg: ChangeFee) {
        self.requireOwner();
        // fee is in basis points; anything above 100% would make feeCalc return a
        // negative payout and brick every claim on every fight.
        require(msg.fee <= 10000, "fee out of range");
        self.fee = msg.fee;
    }

    receive(msg: ChangeFeeCollector) {
        self.requireOwner();
        self.feeCollector = msg.feeCollector;
    }

    receive(msg: ChangeMaxPlayersAmount) {
        self.requireOwner();
        self.maxPlayers = msg.maxPlayers;
    }

    receive(msg: ChangeMaxRoundsAmount) {
        self.requireOwner();
        self.maxRounds = msg.maxRounds;
    }

    receive(msg: ChangeMinAmountPerRound) {
        self.requireOwner();
        self.minAmountPerRound = msg.minAmountPerRound;
    }

    fun create(fightMsg: FightMsg) {
        let amountToPlay: Int = fightMsg.rounds * fightMsg.amountPerRound;
        require(self.currentPlayerFight.get(context().sender) == null, "player already busy");
        require(fightMsg.rounds > 0 && fightMsg.rounds <= self.maxRounds, "max rounds amount exceeded");
        require(fightMsg.maxPlayersAmount > 0 && fightMsg.maxPlayersAmount <= self.maxPlayers, "max players amount exceeded");
        require(fightMsg.amountPerRound >= self.minAmountPerRound, "max amount per round exceeded");
        require(context().value >= amountToPlay, "value does not equal sum to play");
        let players: map<Int, Address> = emptyMap();
        players.set(0, context().sender);
        let playersClaimed: map<Address, Bool> = emptyMap();
        playersClaimed.set(context().sender, false);
        let fight: Fight = Fight{
            id:                     self.fullFightsLength,
            owner:                  context().sender,
            createTime:             now(),
            finishTime:             0,
            baseAmount:             amountToPlay,
            amountPerRound:         fightMsg.amountPerRound,
            rounds:                 fightMsg.rounds,
            maxPlayersAmount:       fightMsg.maxPlayersAmount,
            playersCurrentLength:   1,
            players:                players,
            playersClaimed:         playersClaimed,
            escrowed:               amountToPlay,
            paidOut:                0
        };
        self.currentFights.set(self.fullFightsLength, fight);
        self.currentPlayerFight.set(context().sender, self.fullFightsLength);
        self.currentFightsLength += 1;
        self.fullFightsLength += 1;
        emit(fight.toCell())
    }

    fun join(id: Int) {
        if (self.currentFights.get(id) == null) {
            throw(32); // "fight not exist"
        }
        let fight: Fight = self.currentFights.get(id)!!;
        require(self.currentPlayerFight.get(context().sender) == null, "player already busy");
        require(fight.playersCurrentLength < fight.maxPlayersAmount, "fight is full of players");
        require(fight.finishTime == 0, "fight is over");
        require(context().value >= fight.rounds * fight.amountPerRound, "value does not equal sum to play");
        fight.players.set(fight.playersCurrentLength, context().sender);
        self.currentPlayerFight.set(context().sender, id);
        fight.playersClaimed.set(context().sender, false);
        fight.playersCurrentLength += 1;
        fight.escrowed += fight.baseAmount;
        self.currentFights.set(id, fight);
        emit(FightJoin{id: id, joiner: context().sender}.toCell());
    }

    fun withdraw(id: Int) {
        if (self.currentFights.get(id) == null) {
            throw(32); // "fight not exist"
        }
        let fight: Fight = self.currentFights.get(id)!!;
        require(fight.owner == context().sender, "invalid owner");
        require(fight.finishTime == 0, "fight is over");
        require(fight.playersCurrentLength == 1, "fight has players");
        self.currentPlayerFight.del(context().sender);
        self.currentFightsLength -= 1;
        let amount: Int = min(fight.baseAmount, myBalance() - context().value - ton("0.01"));
        send(SendParameters{
            to: context().sender,
            bounce: true,
            value: amount,
            mode: SendRemainingValue + SendIgnoreErrors
        });
        self.currentFights.del(id);
        emit(Withdraw{id: id}.toCell());
    }

    fun finish(finishMsg: Finish) {
        if (self.currentFights.get(finishMsg.data.id) == null) {
            throw(32); // "fight not exist"
        }
        let ctx: Context = context();
        require(finishMsg.data.address == ctx.sender, "signed address does not match sender");
        require(finishMsg.data.contract == myAddress(), "invalid contract address");
        let fight: Fight = self.currentFights.get(finishMsg.data.id)!!;
        require(fight.playersClaimed.get(ctx.sender) != null, "sender is not a participant");
        require(fight.playersClaimed.get(ctx.sender) == false, "already claimed");
        require(fight.paidOut + finishMsg.data.amount <= fight.escrowed, "fight escrow exceeded");
        let hash: Int = finishMsg.data.toCell().hash();
        let check: Bool = checkSignature(hash, finishMsg.signature, self.signerPublicKey);
        require(check, "invalid signature");
        let reserveAmount: Int = myBalance() - ctx.value - finishMsg.data.amount;
        require(reserveAmount >= ton("0.01"), "insufficient contract balance");
        nativeReserve(reserveAmount, ReserveExact);
        fight.playersClaimed.set(ctx.sender, true);
        fight.paidOut += finishMsg.data.amount;
        if (fight.finishTime == 0) {
            fight.finishTime = now();
        }
        let feeData: Fee = self.feeCalc(fight.baseAmount, finishMsg.data.amount);
        if (feeData.fee != 0) {
            send(SendParameters{
                to: self.feeCollector,
                bounce: false,
                value: feeData.fee,
                mode: SendPayGasSeparately
            });
        }
        send(SendParameters{
            to: ctx.sender,
            bounce: false,
            value: feeData.amount,
            mode: SendPayGasSeparately
        });
        // Everything above the reserve is the unspent part of this message's gas;
        // hand it back to the caller. SendRemainingBalance is bounded by the
        // reserve, so this can never dip into another fight's escrow.
        send(SendParameters{
            to: ctx.sender,
            bounce: false,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
        let i: Int = 0;
        let checkerIfAllClaimed: Bool = true;
        while (i < fight.playersCurrentLength) {
            if (fight.playersClaimed.get(fight.players.get(i)!!) == false) {
                checkerIfAllClaimed = false;
            }
            i += 1;
        }
        self.currentFights.set(finishMsg.data.id, fight);
        if (checkerIfAllClaimed) {
            self.currentFights.del(finishMsg.data.id);
        }
        self.currentPlayerFight.del(ctx.sender);
    }

    get fun feeCalc(baseAmount: Int, amount: Int): Fee {
        let feeData: Fee = Fee{amount: 0, fee: 0};
        if (amount > baseAmount) {
            let _toSend: Int = amount - (amount * self.fee) / 10000;
            let _fee: Int = amount - _toSend;
            feeData.amount = _toSend;
            feeData.fee = _fee;
        } else {
            let _toSend: Int = amount;
            feeData.amount = _toSend;
            feeData.fee = 0;
        }
        return feeData;
    }

    get fun currentFights(): map<Int, Fight> {
        return self.currentFights;
    }

    get fun currentFight(id: Int): Fight {
        if (self.currentFights.get(id) == null) {
            throw(32); //fight not exist
        }
        return self.currentFights.get(id)!!;
    }

    get fun currentFightPlayers(id: Int): map<Int, Address> {
        if (self.currentFights.get(id) == null) {
            throw(32); // "fight not exist"
        }
        let fight: Fight = self.currentFights.get(id)!!;
        return fight.players;
    } 

    get fun currentFightPlayerClaimed(id: Int, player: Address): Bool {
        if (self.currentFights.get(id) == null) {
            throw(32); // "fight not exist"
        }
        let fight: Fight = self.currentFights.get(id)!!;
        if (fight.playersClaimed.get(player) == null) {
            throw(32); // "player not exist"
        }
        let claimed: Bool = fight.playersClaimed.get(player)!!;
        return claimed;
    } 

    get fun fee(): Int {
        return self.fee;
    }

    get fun maxPlayers(): Int {
        return self.maxPlayers;
    }

    get fun maxRounds(): Int {
        return self.maxRounds;
    }

    get fun minAmountPerRound(): Int {
        return self.minAmountPerRound;
    }

    get fun currentPlayerFight(player: Address): Int {
        if (self.currentPlayerFight.get(player) == null) {
            throw(32); // "player not exist"
        }
        return self.currentPlayerFight.get(player)!!;
    } 
}

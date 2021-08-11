suits = ["Man","Sou","Pin"];
class Tile{
    constructor(suit,number){
        this.suit = suit;
        this.number = number;
    }
}
function generateBoard(){
    //generate dots,bamboo,character
    //4 of each tile
    Board = [];
    suits.forEach(suit => {
        for(let i=1;i<10;i++){
            let tile = new Tile(suit,i);
            Board.push(tile,tile,tile,tile);
        }
    });
    //generate honour tile
    for(let i = 1;i<8;i++){
        let tile = new Tile("Honors",i);
        Board.push(tile,tile,tile,tile)
    }
    Board = shuffle(Board);
    Board.forEach(element =>{
        console.log(element);
    })
}
function generateEveryTile(){
    let Board = [];
    suits.forEach(suit => {
        for(let i=1;i<10;i++){
            let tile = new Tile(suit,i);
            Board.push(tile);
        }
    });
    for(let i = 1;i<8;i++){
        let tile = new Tile("Honors",i);
        Board.push(tile)
    }
    return Board;
}
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
}
function displayTiles(){
    Tiles = generateEveryTile();
    Tiles.forEach(tile =>{
        link = "static/img/tiles/" + tile.suit+tile.number+".svg"

        rowClass = " class="+"\""+tile.suit+" selectionTile\""
        newlink = "<img src="+link+rowClass + " width='50' height='100' >"
        $("#selection").append(newlink)

    })

}
//returns possible winning combination and score
function validHand(hand,seatWind,prevailingWind,lockedSets,bonus){
    //if(hand.length != 14) return false;

    let hist = [...lockedSets];
    let highestHand = [];
    if(lockedSets.length < 3){
        combinationWins = recursionSet(hand,hist).flat(3-lockedSets.length);
    }else if(lockedSets.length == 3){
        combinationWins = recursionSet(hand,hist);
        if(combinationWins[0] == false) return highestHand;
    }else if(lockedSets.length == 4){
        combinationWins = recursionSet(hand,hist);
        if(combinationWins[0] == false) return highestHand;
        score = calculateScore(combinationWins[1],seatWind,prevailingWind,lockedSets)
        highestHand = [combinationWins[1],score+bonus];
        return highestHand
    }
    if(!combinationWins[0]) return highestHand ;
    let uniqueCombinations = new Set();
    combinationWins.forEach(combination=>{
        if(combination[1] == null) return
        let sortedCombination = combination[1].sort();
        uniqueCombinations.add(JSON.stringify(sortedCombination));
    })
    uniqueCombinations.forEach(winningHand=>{
        let array = JSON.parse(winningHand);
        //console.log(array)

        score = calculateScore(array,seatWind,prevailingWind,lockedSets)
        if(highestHand.length == 0 || score+bonus > highestHand[1]){
            highestHand = [array,score+bonus];
        }
    })
    return highestHand
}
//counts number of certain tile in hand
function countIdentical(hand,tile){
    let i = 0;
    hand.forEach(element=>{
        if(element.number == tile.number && element.suit == tile.suit){
            i++;
        }
    })
    return i;
}
//given hand, return array of possible sets
function generateSets(hand){
    let possibleSets = new Set();
    hand.forEach(tile=>{
        if(countIdentical(hand,tile) >= 3){
            possibleSets.add("p"+tile.suit[0]+tile.number);
        }
        if(ladderExist(hand,tile)){
            possibleSets.add("c"+tile.suit[0]+tile.number)
        }
    })
    return possibleSets;
}
//returns if chow exists given tile, e.g. man5 would check if man456 was possible given hand
function ladderExist(hand,targetTile){
    let flag1 = false;
    let flag2 = false;
    if(!suits.includes(targetTile.suit)) return false;
    hand.forEach(tile=>{
        if(tile.suit == targetTile.suit && tile.number == parseInt(targetTile.number - 1)){
            flag1 = true;
        }
        if(tile.suit == targetTile.suit && tile.number == parseInt(targetTile.number) + 1){
            flag2 = true;
        }
    })
    return flag1 && flag2;
}
//recurses through the hand reducing the size of hand checking all possible combination of winning hand
function recursionSet(hand,hist){
    let index = 0;
    let temp = [];
    if(hand.length == 2){
        if(countIdentical(hand,hand[0]) != 2){
            return [false,null];
        }else{
            //let flag = true;
            //hist.forEach(elem=>{
                //console.log(elem,hand[0])
                //if(elem[0] == "p" && elem[1] == hand[0].suit[0] && elem[2] == hand[0].number) flag = false;
            //})
            //if(flag == false) return [false,null];
            let string = "d"+hand[0].suit[0]+hand[0].number
            hist.push(string)
            return [true,hist];
        }
    }
    sets = generateSets(hand);
    if(sets.size == 0){
        return [false,null];
    }
    sets.forEach(set=>{
        let newHist = [...hist];
        newHist.push(set);
        let newHand = [...hand];
        let setType = set.charAt(0);
        let setSuit = set.charAt(1);
        let setNumber = set.charAt(2);
        if(setType == "p"){
            for(let i = 0;i<3;i++){
                index = newHand.findIndex(x=>{
                    if(x.suit[0] == setSuit && x.number == setNumber) return true;
                })
                newHand.splice(index,1)
            }
        }else if(setType == "c"){
            index = newHand.findIndex(x=>{
                    if(x.suit[0] == setSuit && x.number == parseInt(setNumber) - 1) return true;
                })
            newHand.splice(index,1)
            index = newHand.findIndex(x=>{
                    if(x.suit[0] == setSuit && x.number == setNumber) return true;
                })
            newHand.splice(index,1)
            index = newHand.findIndex(x=>{
                    if(x.suit[0] == setSuit && x.number == parseInt(setNumber) + 1) return true;
                })
            newHand.splice(index,1)
        }

        let result = recursionSet(newHand,newHist)
        if(result[0]!=false){
            temp.push(result)
        }



    })

    return temp;
}
//given array, calculate score of hand
function calculateScore(winningHand,seatWind,prevailingWind,lockedSets){
    let score = 0;
    let winFromWall = false;
    console.log(lockedSets)
    if(lockedSets.length == 0) winFromWall = true;
    if(commonHand(winningHand)) score = 1;
    if(allInTriplets(winningHand)) score = 3;
    if(mixedOneSuit(winningHand)) score += 3;
    if(allOneSuit(winningHand)) score += 4;
    if(allHonorTiles(winningHand)) score = 10;
    if(smallDragons(winningHand)) score += 4;
    if(greatDragons(winningHand)) score += 8;
    if(smallWinds(winningHand)) score +=6;
    if(greatWinds(winningHand)) score = 13;
    if(orphans(winningHand)) score = 10;
    if(allKongs(winningHand)) score = 13;
    if(selfTriplets(winningHand,winFromWall)) score +=8;

    if(!selfTriplets(winningHand,winFromWall) && winFromWall) score++;
    if(!(smallDragons(winningHand)||greatDragons(winningHand))){
        if(winningHand.includes("pH5")) score++;
        if(winningHand.includes("pH6")) score++;
        if(winningHand.includes("pH7")) score++;
    }
    if(!(smallWinds(winningHand)||greatWinds(winningHand))){
        if(winningHand.includes("pH"+seatWind)) score++;
        if(winningHand.includes("pH"+prevailingWind)) score++;
    }
    if(mixedOrphans(winningHand)) score++;
    return score;
}
//checks if every meld is a chow
function commonHand(winningHand){
    let c = 4;
    let d = 1;
    winningHand.forEach(elem=>{
        if(elem[0] == "c") c--;
        if(elem[0] == "d") d--;
    })
    if(c == 0 && d == 0) return true
    return false;
}
//checks if every meld is either a pong or kong
function allInTriplets(winningHand){
    let p = 4;
    let d = 1;
    winningHand.forEach(elem=>{
        if(elem[0] == "p"||elem[0] == "k") p--;
        if(elem[0] == "d") d--;
    })
    if(p == 0 && d == 0) return true
    return false;
}
function mixedOneSuit(winningHand){
    let flag = true;
    suit = winningHand[0][1];
    winningHand.forEach(elem=>{
        if(suit != elem[1] && elem[1]!="H"){
            flag = false;
        }
    })
    return flag
}
function allOneSuit(winningHand){
    suit = winningHand[0][1];
    let flag = true;
    winningHand.forEach(elem=>{
        //console.log(suit,elem[1],suit!=elem[1])
        if(suit != elem[1]) flag =  false
    })
    return flag;
}
function allHonorTiles(winningHand){
    flag = true;
    winningHand.forEach(elem=>{
        if("H" != elem[1]) flag =  false
    })
    return flag;
}
function smallDragons(winningHand){
    let p = 2;
    let d = 1;
    winningHand.forEach(elem=>{
        if("pH5" == elem||"pH6" == elem||"pH7" == elem) p--;
        if("dH5" == elem||"dH6" == elem||"dH7" == elem) d--;
    })
    if(p == 0 && d == 0) return true;
    return false
}
function greatDragons(winningHand){
    let counter = 3;
    winningHand.forEach(elem=>{
        if("pH5" == elem||"pH6" == elem||"pH7" == elem) counter--;
    })
    if(counter == 0) return true;
    return false
}
function smallWinds(winningHand){
    let p = 3;
    let d = 1;
    winningHand.forEach(elem=>{
        if("pH1" == elem||"pH2" == elem||"pH3" == elem||"pH4" == elem) p--;
        if("dH1" == elem||"dH2" == elem||"dH3" == elem||"dH4" == elem) d--;
    })
    if(p == 0 && d == 0) return true;
    return false
}
function greatWinds(winningHand){
    let counter = 4;
    winningHand.forEach(elem=>{
        if("pH1" == elem||"pH2" == elem||"pH3" == elem||"pH4" == elem) counter--;
    })
    if(counter == 0) return true;
    return false
}
function orphans(winningHand){
    let flag = true
    winningHand.forEach(elem=>{
        if(!(elem[2] == 1 || elem[2] == 9) || elem[1] == "H" ) flag =  false
    })
    return flag;
}
function mixedOrphans(winningHand){
    let flag = true;
    winningHand.forEach(elem=>{
        if(!(elem[2] == 1 || elem[2] == 9) && elem[1] !="H") flag = false
    })
    return flag;
}
function allKongs(winningHand){
    let flag = true;
    winningHand.forEach(elem=>{
        if(elem[0] !="k" && elem[0] !="d") flag = false
    })
    return flag;
}
function selfTriplets(winningHand,winFromWall){
    let flag = true;
    winningHand.forEach(elem=>{
        if(elem[0] !="p" && elem[0] !="d") flag = false
    })
    return flag && winFromWall;
}
displayTiles();
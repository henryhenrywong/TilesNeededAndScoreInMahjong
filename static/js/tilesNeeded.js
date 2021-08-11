//add tile to 'current hand' on left click
$(".selectionTile").click(function(){
    link = $(this).attr("src")
    if(checkCurrentAndDeclaredLength() <= $('#handContainer').children().length) return
    if(tileCount(link)<=3){
        newlink = "<img src="+link+" class=handTile width='50' height='100' >"
        $("#handContainer").append(newlink)
    }
})
// remove tile from 'current hand:' on right click
$(document).on("contextmenu", ".handTile", function(e){
   $(this).remove();
   return false;
});
//adds pung, chow and kong to the declared melds on right click
$(document).on("contextmenu", ".selectionTile", function(e){
    if(checkCurrentAndDeclaredLength() - $('#handContainer').children().length < 3) return false
    let link = $(this).attr("src")
    let type = $("#meldType input[type='radio']:checked").val()
    currRow = checkDeclaredGridRow() + 1
    if(currRow == 5) return false
    if(type == "Pung"){
        if(tileCount(link)>1) return false
        newlink = "<img src="+link+" style=grid-row:"+currRow+" class=lockTile width='50' height='100' >"
        $("#lockContainer").append(newlink,newlink,newlink)
    }else if(type == "Chow"){
        let string = link.match(/\/tiles\/(.+)(\d)\.svg/)
        let suit = string[1]
        let number = parseInt(string[2])
        if(suits.includes(suit) && number != 1 && number != 9){
            for(let i = -1;i<2;i++){
                link = "static/img/tiles/" + suit+parseInt(number+i)+".svg"
                console.log(link)
                if(tileCount(link)>3) return false
            }
            for(let i = -1;i<2;i++){
                link = "static/img/tiles/" + suit+parseInt(number+i)+".svg"
                newlink = "<img src="+link+" style=grid-row:"+currRow+ " class=lockTile width='50' height='100' >"
                $("#lockContainer").append(newlink)
            }
        }
    }else if(type == "Kong"){
        if(tileCount(link)>0) return false
        newlink = "<img src="+link+" style=grid-row:"+currRow+" class=lockTile width='50' height='100' >"
        $("#lockContainer").append(newlink,newlink,newlink,newlink)
    }
    return false
});
//checks declared and current hand and output to winning hand: the possible winning combination and respective score
function checkHand(){
    $('#sampleOutput').empty()
    $('#scorePlaceholder').empty()
    if(checkCurrentAndDeclaredLength() != $('#handContainer').children().length) return
    let hand = []
    for (elem of $('#handContainer').children()){
        hand.push(elem.src.match(/tiles\/(.+)\.svg/)[1])
    }
    let bonusWinConScore = $("#winningConditions input[type='radio']:checked").val();
    if(bonusWinConScore == null) bonusWinConScore = 0;
    bonusWinConScore = parseInt(bonusWinConScore)
    editedHand = htmlHandToObjectHand(hand);
    let seatWind = parseInt($("#seatWind")[0].options.selectedIndex)+1;
    let prevailingWind = parseInt($("#prevailingWind")[0].options.selectedIndex)+1;
    //convert declared meld to pM6 form
    let lockedSets = declaredHtmlToSet();
    //iterate every possible tile for the missing 14th tile
    Tiles = generateEveryTile();
    Tiles.forEach(missingTile=>{
        let newHand = [...editedHand]
        let counter = 0;
        newHand.forEach(elem=>{
            if(elem.suit == missingTile.suit && elem.number == missingTile.number) counter++;
        })
        if(counter > 3) return
        newHand.push(missingTile)
        //check for thirteen orphan TODO
        if(thirteenOrphan(newHand)){
            displayThirteenOrphan(missingTile,bonusWinConScore);
            let currRow = checkWinningHandGridRow();
            newlink = "<div style=grid-row:"+currRow+">Missing: </div>"
            $("#sampleOutput").append(newlink)
            link = "static/img/tiles/" + missingTile.suit+missingTile.number+".svg"
            newlink = "<img src="+link+" style=grid-row:"+currRow+" width='50' height='100' >"
            $("#sampleOutput").append(newlink)
            return
        }
        //check for nine gates TODO
        if(checkNineGates(newHand)){
            displayNineGates(missingTile,bonusWinConScore);
            let currRow = checkWinningHandGridRow();
            newlink = "<div style=grid-row:"+currRow+">Missing: </div>"
            $("#sampleOutput").append(newlink)
            link = "static/img/tiles/" + missingTile.suit+missingTile.number+".svg"
            newlink = "<img src="+link+" style=grid-row:"+currRow+" width='50' height='100' >"
            $("#sampleOutput").append(newlink)
            return
        }
        let data = validHand(newHand,seatWind,prevailingWind,lockedSets,bonusWinConScore);
        displayWinningHand(data[0],data[1]);
        if(data[0] != null){
            let currRow = checkWinningHandGridRow();
            newlink = "<div style=grid-row:"+currRow+">Missing: </div>"
            $("#sampleOutput").append(newlink)
            link = "static/img/tiles/" + missingTile.suit+missingTile.number+".svg"
            newlink = "<img src="+link+" style=grid-row:"+currRow+" width='50' height='100' >"
            $("#sampleOutput").append(newlink)
        }
    })


}
//removes entire meld on right click
$(document).on("contextmenu", ".lockTile", function(e){
   let currRow = this.style.gridRow
   for(child of $('#lockContainer').children()){
        if(child.style.gridRow == currRow){
            child.remove();
        }else if(child.style.gridRow[0] > currRow[0]){
            child.style.gridRow = parseInt(child.style.gridRow[0])-1;
        }
    }
   return false;
});
//empties current hand and declared meld
function clearHand(){
    $('#handContainer').empty();
    $('#lockContainer').empty();
}
//converts html objects to object array
function htmlHandToObjectHand(hand){
    let newHand = []
    hand.forEach(elem=>{
        let match = elem.match(/(.+)(\d)/)
        let tile = new Tile(match[1],match[2]);
        newHand.push(tile)
    })
    return newHand
}
//returns number of tiles in handContainer & lockContainer given src link
function tileCount(src){
    let counter = 0 ;
    for (elem of $('#handContainer').children()){
        let string = elem.src.match(/static\/img\/tiles\/.+.svg/)
        if(string == src){
            counter++
        }
    }
    for (elem of $('#lockContainer').children()){
        let string = elem.src.match(/static\/img\/tiles\/.+.svg/)
        if(string == src){
            counter++
        }
    }
    return counter
    if(counter>3) return false
    return true
}
//given array e.g. ["cM5","cM5","cM5","cS6","dS9"] display hand in #sampleOutput
function displayWinningHand(hand,score){
    if(hand == null){
        return
    }
    let currentRow = checkWinningHandGridRow() + 1;
    //newlink = "<img src="+link+" style=grid-row:"+currRow+" class=lockTile width='50' height='100' >"
    hand.forEach(tile=>{
        //if chow
        if(tile[0] == "c"){
            let suit = convertCharacterToSuit(tile[1]);
            let number = parseInt(tile[2]);
            for(let i = -1;i<2;i++){
                link = "static/img/tiles/" + suit+parseInt(number+i)+".svg"
                newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }


        }else if(tile[0] == "p"){
        //if pung
            let suit = convertCharacterToSuit(tile[1]);
            let number = tile[2];
            for(let i = 0;i<3;i++){
                link = "static/img/tiles/" + suit+number+".svg"
                newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }
        }else if(tile[0] == "d"){
        //if pair
            let suit = convertCharacterToSuit(tile[1]);
            let number = tile[2];
            for(let i = 0;i<2;i++){
                link = "static/img/tiles/" + suit+number+".svg"
                newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }
        }else if(tile[0] == "k"){
            let suit = convertCharacterToSuit(tile[1]);
            let number = tile[2];
            link = "static/img/tiles/" + suit+number+".svg"
            newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
            $("#sampleOutput").append(newlink,newlink,newlink,newlink)

        }
    })
    newlink = "<h1 style=grid-row:"+currentRow+ ">Score: " +score+" </h1>"
    $("#sampleOutput").append(newlink)
}
function convertCharacterToSuit(char){
    if(char == "M") return "Man"
    if(char == "S") return "Sou"
    if(char == "P") return "Pin"
    if(char == "H") return "Honors"
}
function checkDeclaredGridRow(){
    let curr = 0
    for(child of $('#lockContainer').children()){
        if(child.style.gridRow[0] > curr){
            curr = child.style.gridRow;
        }
    }
    return parseInt(curr)
}
function checkWinningHandGridRow(){
    let curr = 0
    for(child of $('#sampleOutput').children()){
        if(parseInt(child.style.gridRow.match(/[\d]+/)[0]) > curr){
            curr = child.style.gridRow.match(/[\d]+/)[0];
        }
    }
    return parseInt(curr)
}
function declaredHtmlToSet(){
    let counter = 0;
    let prev = 0;
    let temp = [];
    let array = [];
    if($('#lockContainer').children().length == 0) return array;
    for(child of $('#lockContainer').children()){
        tile = child.src.match(/tiles\/(.+)(\d).svg/)
        if(prev == 0 || prev == child.style.gridRow[0]){
            prev = child.style.gridRow[0]
            temp.push(tile[1][0]+tile[2])
        }else{
            if(temp.length == 4){
                string = "k" + temp[0]
                array.push(string)
            }else{
                if(temp.every( (val, i, arr) => val === arr[0] )   ){
                    string = "p" + temp[0]
                    array.push(string)
                }else{
                    string = "c" + temp[1]
                    array.push(string)
                }
            }
            temp.splice(0, temp.length)
            temp.push(tile[1][0]+tile[2])
            prev = child.style.gridRow[0]
        }
    }
    if(temp.length == 4){
        string = "k" + temp[0]
        array.push(string)
    }else{
        if(temp.every( (val, i, arr) => val === arr[0] )   ){
            string = "p" + temp[0]
            array.push(string)
        }else{
            string = "c" + temp[1]
            array.push(string)
        }
    }
    return array
}
function checkCurrentAndDeclaredLength(){
    let numGridRow = checkDeclaredGridRow();
    let handLength = $('#handContainer').children().length;
    //4sets and a pair
    let neededTiles = (4 - numGridRow) * 3 + 1;
    return neededTiles
}
function thirteenOrphan(hand){
    let flag = true;
    let currHand = JSON.parse(JSON.stringify(hand))
    let template = generateThirteenOrphan();
    template.forEach(elem=>{
        index = currHand.findIndex(x=>{
            if(x.suit == elem.suit && x.number == elem.number) return true;
        })
        if(index == -1) flag = false
        currHand.splice(index,1)
    })
    if(currHand.length != 1){
        flag = false;
    }else{
        index = template.findIndex(x=>{
            if(x.suit == currHand[0].suit && x.number == currHand[0].number) return true;
        })
        if(index == -1) flag = false
    }
    return flag

}
function generateThirteenOrphan(){
    let hand = [];
    suits.forEach(suit => {

        let tile = new Tile(suit,1);
        let tile1 = new Tile(suit,9);
        hand.push(tile,tile1);

    });
    for(let i = 1;i<8;i++){
        let tile = new Tile("Honors",i);
        hand.push(tile)
    }
    return hand;
}
function displayThirteenOrphan(pair,bonus){
    let currentRow = checkWinningHandGridRow() + 1;
    let temp = generateThirteenOrphan();
    temp.push(pair)
    temp.forEach(tile=>{
        link = "static/img/tiles/" + tile.suit+tile.number+".svg"
        newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
        $("#sampleOutput").append(newlink)
    })
    newlink = "<h1 style=grid-row:"+currentRow+ ">Score: " +parseInt(13+bonus)+" </h1>"
    $("#sampleOutput").append(newlink)
}
function thirteenOrphan(hand){
    let flag = true;
    let currHand = JSON.parse(JSON.stringify(hand))
    let template = generateThirteenOrphan();
    template.forEach(elem=>{
        index = currHand.findIndex(x=>{
            if(x.suit == elem.suit && x.number == elem.number) return true;
        })
        if(index == -1) flag = false
        currHand.splice(index,1)
    })
    if(currHand.length != 1){
        flag = false;
    }else{
        index = template.findIndex(x=>{
            if(x.suit == currHand[0].suit && x.number == currHand[0].number) return true;
        })
        if(index == -1) flag = false
    }
    return flag

}
function checkNineGates(hand){
    let currHand = JSON.parse(JSON.stringify(hand));
    let flag = currHand.every( (val, i, arr) => val.suit === arr[0].suit );
    let temp = [1,1,1,2,3,4,5,6,7,8,9,9,9];
    temp.forEach(elem=>{
        index = currHand.findIndex(x=>{
            if(x.number == elem) return true;
        })
        if(index == -1) flag = false;
        currHand.splice(index,1);
    })

    if(currHand.length != 1) flag = false;
    return flag;
}
function displayNineGates(pair,bonus){
    let currentRow = checkWinningHandGridRow() + 1;
    let suit = pair.suit
    let temp = [1,1,1,2,3,4,5,6,7,8,9,9,9];
    temp.push(pair.number)
    temp.forEach(tile=>{
        link = "static/img/tiles/" + suit+tile+".svg"
        newlink = "<img src="+link+" style=grid-row:"+currentRow+ " width='50' height='100' >"
        $("#sampleOutput").append(newlink)
    })
    newlink = "<h1 style=grid-row:"+currentRow+ ">Score: " +parseInt(10+bonus)+" </h1>"
    $("#sampleOutput").append(newlink)
    console.log(parseInt(10+bonus),bonus)
}

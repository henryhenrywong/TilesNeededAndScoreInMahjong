$(".selectionTile").click(function(){
    if($("#handContainer").children().length < 14){
        link = $(this).attr("src")
        if(!lessThanFour(link)) return;
        newlink = "<img src="+link+" class=handTile width='50' height='100' >"
        $("#handContainer").append(newlink)
    }
})
$(document).on("contextmenu", ".handTile", function(e){
   $(this).remove();
   return false;
});
function checkHand(){
    $('#sampleOutput').empty()
    $('#scorePlaceholder').empty()
    let hand = []
    for (elem of $('#handContainer').children()){
        hand.push(elem.src.match(/tiles\/(.+)\.svg/)[1])
    }
    editedHand = htmlHandToObjectHand(hand);
    let seatWind = parseInt($("#seatWind")[0].options.selectedIndex)+1;
    let prevailingWind = parseInt($("#prevailingWind")[0].options.selectedIndex)+1;
    let data = validHand(editedHand,seatWind,prevailingWind,[]);
    displayWinningHand(data[0],data[1]);

}
function clearHand(){
    $('#handContainer').empty();
}
function htmlHandToObjectHand(hand){
    let newHand = []
    hand.forEach(elem=>{
        let match = elem.match(/(.+)(\d)/)
        let tile = new Tile(match[1],match[2]);
        newHand.push(tile)
    })
    return newHand
}
//checks number of tiles in handContainer is less than 4 given src link
function lessThanFour(src){
    let counter = 0 ;
    for (elem of $('#handContainer').children()){
        let string = elem.src.match(/static\/img\/tiles\/.+.svg/)
        if(string == src){
            counter++
        }
    }

    if(counter>3) return false
    return true
}
//given array e.g. ["cM5","cM5","cM5","cS6","dS9"] display hand in #sampleOutput
function displayWinningHand(hand,score){
    if(hand == null){
        newlink = "<h1 >Invalid Hand!</h1>"
        $("#scorePlaceholder").append(newlink)
        return
    }
    newlink = "<h1 >Score: " +score+" </h1>"
    $("#scorePlaceholder").append(newlink)
    hand.forEach(tile=>{
        //if chow
        if(tile[0] == "c"){
            let suit = convertCharacterToSuit(tile[1]);
            let number = parseInt(tile[2]);
            for(let i = -1;i<2;i++){
                link = "static/img/tiles/" + suit+parseInt(number+i)+".svg"
                newlink = "<img src="+link+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }


        }else if(tile[0] == "p"){
        //if pung
            let suit = convertCharacterToSuit(tile[1]);
            let number = tile[2];
            for(let i = 0;i<3;i++){
                link = "static/img/tiles/" + suit+number+".svg"
                newlink = "<img src="+link+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }
        }else if(tile[0] == "d"){
        //if pair
            let suit = convertCharacterToSuit(tile[1]);
            let number = tile[2];
            for(let i = 0;i<2;i++){
                link = "static/img/tiles/" + suit+number+".svg"
                newlink = "<img src="+link+ " width='50' height='100' >"
                $("#sampleOutput").append(newlink)
            }
        }
    })
}
function convertCharacterToSuit(char){
    if(char == "M") return "Man"
    if(char == "S") return "Sou"
    if(char == "P") return "Pin"
    if(char == "H") return "Honors"
}
const game = {}

//Game Loop
game.timer = setInterval(loop, 30);

function loop()
{
   moveBackground();
}

function moveBackground()
{

   const left = parseInt($("#gameBackground").css("background-position"));
   $("#gameBackground").css("background-position", left - 1);

}
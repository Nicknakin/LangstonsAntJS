var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var defaultColor = "WHITE";
var wrap = true;
var numAntsSlider = document.getElementById("numAnts");
var HzSlider = document.getElementById("hz");
var stepsPerCallSlider = document.getElementById("stepsPerCall");
var numAnts = numAntsSlider.value;
var Hz = HzSlider.value;;
var stepsPerCall = stepsPerCallSlider.value;
var step = 0;
var startTime = new Date();

var dirty = false;

class Box{
    constructor(x, y, size, color, state){
        this.x = x*size;
        this.y = y*size;
        this.state = (!state)? 0: state;
        this.color = (!color)? defaultColor: color;
        this.draw = true;
    }

    update(color){
        this.state = !this.state;
        this.color = (this.state)? color: defaultColor;
        this.draw = true;
    }
}

//DIRECTIONS
//0: Up
//1: Right
//2: Down
//3: Left
class Ant{
    constructor(x, y, dir, color){
        this.x = x-x%1;
        this.y = y-y%1;
        this.dir = (!dir)? 3: dir%4;
        this.color = (!color)? defaultColor: color;
    }

    turnLeft(){
        this.dir = (this.dir+3)%4;
    }

    turnRight(){
        this.dir = (this.dir+1)%4;
    }

    moveForward(box){
        if(!box) return;
        box.update(this.color);
        if(box.state)
            this.turnRight();
        else
            this.turnLeft();
        if(this.dir ==  0)
            this.y += 1;
        if(this.dir == 1)
            this.x += 1;
        if(this.dir == 2)
            this.y -= 1;
        if(this.dir == 3)
            this.x -= 1;
    }

    enableWrap(width, height){
        this.x = (this.x+width)%width;
        this.y = (this.y+height)%height;
    }
}

class Grid{
    constructor(width, height, size){
        this.size = size;
        this.width = width;
        this.height = height;
        this.blocks = new Array(height);
        for(let i = 0; i < this.height; i++){
            this.blocks[i] = new Array(width);
            for(let k = 0; k < this.width; k++){
                this.blocks[i][k] = new Box(k, i, this.size);
            }
        }
        this.ants = [];
    } 
    
    addAnt(x, y, dir, color){
        this.ants.push(new Ant(x, y, dir, color));
    }
    
    moveAnts(){
        for(let i = 0; i < this.ants.length; i++){
            this.ants[i].moveForward(this.blocks[this.ants[i].y][this.ants[i].x]);
            if(wrap)
                this.ants[i].enableWrap(this.width, this.height);
            else if(this.antDies(this.ants[i]))
                this.ants.splice(i,1);
        }
    }

    getBoxes(){
        let temp = [];
        for(let i = 0; i < this.height; i++){
            for(let k = 0; k < this.width; k++){
                if(this.blocks[i][k].draw)
                    temp.push(this.blocks[i][k]);
            }
        }
        return temp;
    }

    getAll(){
        return [this.getBoxes(), this.ants];
    }

    antDies(ant){
        return !((ant.x >= 0 && ant.x < this.width) && (ant.y >= 0 && ant.y < this.height));
    }
}

var interval;
var grid;

function main(){
    clearInterval(interval);
    ctx.fillRect(0,0,canvas.width,canvas.height);
    let division = 1;
    grid = new Grid(canvas.width/division, canvas.height/division, division);
    for(let i = 0; i < numAnts; i++){
        let x = Math.floor(Math.random()*grid.width);
        let y = Math.floor(Math.random()*grid.height);
        let dir = Math.floor(Math.random()*4);
        let color = getRandomColor();
        grid.addAnt(x,y,dir,color);
    }
    
    dirty = false;
    startTime = new Date();
    step = 0;

    interval = setInterval(updateLoop, (1000/Hz));
}

function updateLoop(){
    for(let i = 0; i < stepsPerCall; i++){
        update();
    }
    let currentTime = new Date();
    let timeDiff = Math.round((currentTime-startTime)/10)/100;
    let timeEst = step/Hz/stepsPerCall;
    let timeHang = Math.round((timeDiff-timeEst)*1000)/1000;
    let info = "Step: " + step;
    info += "<br />Time Elapsed: " + timeDiff + "s";
    info += "<br />Hz: " + Hz;
    info += "<br />Num Ants: " + numAnts;
    info += "<br />Steps Per Update: " + stepsPerCall;
    info += "<br />Steps per Second: " + stepsPerCall*Hz;
    if(!dirty) info += "<br />Hang Time: " + timeHang + "s";
    document.getElementById("par").innerHTML = info;
}

function update(){
    step++;
    flag = false;
    grid.moveAnts();
    if(step%stepsPerCall == 0){
        let drawables = grid.getAll();
        for(let i = 0; i < drawables[0].length; i++){
            let block = drawables[0][i];
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, grid.size, grid.size);
            block.draw = false;
        }
    }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color + "FF";
}

// Update the current slider value (each time you drag the slider handle)
numAntsSlider.oninput = function() {
    numAnts = this.value;
    main();
}

HzSlider.oninput = function(){
    dirty = true;
    Hz = this.value;
    clearInterval(interval);
    if(Hz != 0)
        interval = setInterval(updateLoop, 1000/Hz);
}

stepsPerCallSlider.oninput = function(){
    dirty = true;
    stepsPerCall = this.value;
}

main();

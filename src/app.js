(()=>{
    class cursor {
        x = 0
        y = 0
        type = 0
        rotate = 0
        constructor(x = 0, y = 0, type = 0, rotate = 0) {
            this.x = x
            this.y = y
            this.rotate = rotate
            this.type = type
        }
    }
    
    const W = 12, H = 25;
    let board = new Int32Array(W * H);
    let current = new cursor();
    let gameover = false;
    
    const blocks = [
        { rotate: 1, p: [[0, 0], [0, 0], [0, 0]], color: '#FFF' },  // null
        { rotate: 2, p: [[0, -1], [0, 1], [0, 2]], color: '#F00' },  // |
        { rotate: 4, p: [[0, -1], [0, 1], [1, 1]], color: '#0F0' },  // J
        { rotate: 4, p: [[0, -1], [0, 1], [-1, 1]], color: '#00F' },  // L
        { rotate: 2, p: [[0, -1], [1, 0], [1, 1]], color: '#0FF' },  // key1
        { rotate: 2, p: [[0, -1], [-1, 0], [-1, 1]], color: '#F0F' },  // key2
        { rotate: 1, p: [[0, 1], [1, 0], [1, 1]], color: '#880' },  // square
        { rotate: 4, p: [[0, -1], [1, 0], [-1, 0]], color: '#F80' },  // T
        { rotate: 1, p: [[0, 0], [0, 0], [0, 0]], color: '#555' },  // null
    ];
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = W * 20 + 10*20;
    canvas.height = H * 20;
    
    /** initialize game*/
    function init() {
        board.fill(0);
        for (let x = 0; x < W; x++) {
            board[x] = 8;
            board[W * (H - 1) + x] = 8;
        }
        for (let y = 0; y < H; y++) {
            board[W * y] = 8;
            board[W * (y + 1) - 1] = 8;
        }
        gameover = false;
        current.x = 5, current.y = 4;
        current.type = Math.floor(Math.random() * 7) + 1;
    }
    
    /** if it has space to put block, this puts block and returns true. if not, this returns false.*/
    function putBlock(c = new cursor(), action = true) {
        if (board[c.x + c.y * W] != 0) {
            return false;
        }
        if (action) {
            board[c.x + c.y * W] = c.type;
        }
        for (let i = 0; i < 3; i++) {
            let [dx, dy] = blocks[c.type].p[i];
            let r = c.rotate %= blocks[c.type].rotate;
            for (let j = 0; j < r; j++) {
                let nx = dx, ny = dy;
                dx = ny;
                dy = -nx;
            }
            if (board[c.x + dx + (c.y + dy) * W] != 0) {
                return false;
            }
            if (action) {
                board[c.x + dx + (c.y + dy) * W] = c.type;
            }
        }
        if (!action) {
            putBlock(c, true);
        }
        return true;
    }
    
    /** delete block */
    function delBlock(c = new cursor()) {
        board[c.x + c.y * W] = 0;
        for (let i = 0; i < 3; i++) {
            let [dx, dy] = blocks[c.type].p[i];
            let r = c.rotate %= blocks[c.type].rotate;
            for (let j = 0; j < r; j++) {
                let nx = dx, ny = dy;
                dx = ny;
                dy = -nx;
            }
            board[c.x + dx + (c.y + dy) * W] = 0;
        }
    }
    
    /** delete completed line */
    function delLine() {
        for (let y = H-2; y >=1; y--) {
            let flag = true;
            for (let x = 1; x < W-1; x++) {
                if (board[x + y * W] == 0) {
                    flag = false;
                }
            }
            if (flag) {
                console.log("y",y)
                for (let Y = y; Y >=2 ; Y--) {
                    for (let X = 1; X < W-1; X++) {
                        board[X + Y * W] = board[X + (Y - 1) * W];
                    }
                }
                y++;
            }
        }
    }
    
    /** update game state*/
    function blockDown() {
        delBlock(current);
        current.y++;
        if (!putBlock(current, false)) {
            current.y--;
            putBlock(current, false);
            console.log("OK");
            delLine();
            current.x = 5;
            current.y = 4;
            current.type = Math.floor(Math.random() * 7) + 1;
            if (!putBlock(current, false)) {
                gameover = true;
                alert("GAMEOVER")
                init();
            }
        }
    }
    
    let pressTime = 0, interval = 0, pause = false, keyCode = -10;
    
    function processInput(k) {
        let n = new cursor(current.x, current.y, current.type, current.rotate);
        switch (k) {
            case "ArrowLeft":
                n.x--;
                break;
            case "ArrowRight":
                n.x++;
                break;
            case "ArrowUp":
                n.rotate++;
                break;
            case "ArrowDown":
                n.y++;
                break;
            case " ":
            case "Enter":
                pause=!pause;
                break;
        }
        if (gameover || pause) return;
        if (n.x != current.x || n.y != current.y || n.rotate != current.rotate) {
            delBlock(current);
            if (putBlock(n, false)) {
                current = n;
            } else {
                putBlock(current, false);
            }
        }
        draw();
    }
    
    function update() {
        if (!gameover && !pause) {
            if (keyCode != null)
                pressTime++;
            if (pressTime > 50) {
                processInput(keyCode);
            }
            if (interval % 20 == 0)
                blockDown();
        }
        interval++;
        draw();
    }
    
    function draw() {
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.rect(20, 20, W * 20 -39, H * 20 -39);
        ctx.fill();
        for (let i = 0; i < W; i++) {
            for (let j = 0; j < H; j++) {
                ctx.fillStyle = blocks[board[i + j * W]].color;
                ctx.beginPath();
                ctx.rect(i * 20 + 1, j * 20 + 1, 19, 19);
                ctx.fill();
            }
        }
    }

    document.addEventListener("keydown", function (e) {
        keyCode = e.key;
        console.log(e.key)
        processInput(e.key);
    }, true);
    document.addEventListener("keyup", function (e) {
        keyCode = null;
        pressTime = 0;
    })

    let mx=0,my=0,dx=0,dy=0;
    document.addEventListener("touchstart",(e)=>{
        mx=e.touches[0].clientX;
        my=e.touches[0].clientY;
    })
    document.addEventListener("touchmove",(e)=>{
        dx=e.touches[0].clientX-mx;
        dy=e.touches[0].clientY-my;
        if(dx>=20 && interval%6==0){
            processInput("ArrowRight");
        }else if(dx<=-20 && interval%6==0){
            processInput("ArrowLeft");
        }else if(dy<=-window.screen.height/5){
            my=e.touches[0].clientY;
            processInput("ArrowUp");
        }else if(dy>=20 && interval%2==0){
            processInput("ArrowDown");
        }
    })

    let isTracking=false;
    document.addEventListener("mousedown",(e)=>{
        mx=e.clientX;
        my=e.clientY;
        isTracking=true;
    })
    document.addEventListener("mousemove",(e)=>{
        if(!isTracking){
            return;
        }
        dx=e.clientX-mx;
        dy=e.clientY-my;
        if(dx>=20 && interval%6==0){
            processInput("ArrowRight");
        }else if(dx<=-20 && interval%6==0){
            processInput("ArrowLeft");
        }else if(dy<=-50 && interval%20==0){
            processInput("ArrowUp");
        }else if(dy>=20 && interval%2==0){
            processInput("ArrowDown");
        }
    })
    document.addEventListener("mouseup",(e)=>{
        isTracking=false;
    })

    init();
    setInterval(update,20);
})()

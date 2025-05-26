const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight

const levelElement = document.getElementById("levelElement")
const nextLevelElement = document.getElementById("nextLevelElement")
const startGameBtn = document.getElementById("startGameBtn")
const startElement = document.querySelector(".startBoardContainer")
const pointStart = document.getElementById("pointStart")

const levelCurrent = document.getElementById("levelCurrent")
const levelTarget = document.getElementById("levelTarget")
const rankContainer = document.querySelector(".rankContainer");
const bottomLeftControl = document.querySelector(".bottomLeftControl")
const gameLevelBarContainer = document.getElementById("gameLevelBarContainer")

const levelBar = document.getElementById("levelBar")

let projectilesSpeed = 4
let enemiesSpeed = 1

class Player {
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.98
class Particle {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2
const player = new Player(x,y,10,'wheat')

let projectiles = []
let enemies = []
let particles = []
let enemiesSpawnerIntervalId
let intervalSpawnEnemies = 1000

function init(){
    projectiles = []
    enemies = []
    particles = []
    score = 0
    gameLevel = 1
    pointToNextLevel = 100
    projectilesSpeed = 4
    enemiesSpeed = 1
    levelElement.textContent = gameLevel
    nextLevelElement.textContent = gameLevel + 1
    levelCurrent.textContent = score
    levelTarget.textContent = pointToNextLevel
    pointStart.textContent = score

    updateLevelBar()

    rankContainer.style.display = "none"

    infoMsg('Get ready, the game has begun!')
}

function spawnEnemies(){
    enemiesSpawnerIntervalId = setInterval(()=>{
        const radius = Math.random() * (30 - 4) + 4
        let x;
        let y;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle) * enemiesSpeed,
            y: Math.sin(angle) * enemiesSpeed
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },intervalSpawnEnemies)
}

let animationId
let score = 0
let gameLevel = 1
let pointToNextLevel = 100

function updateLevelBar(){
    const barSize = score/pointToNextLevel*100
    levelBar.style.width = barSize + "%"
}

function newSpeedLevel(){
    pointToNextLevel += Math.floor(Math.random() * (650 - 250) + 250)
    gameLevel++
    levelElement.textContent = gameLevel
    nextLevelElement.textContent = gameLevel + 1
    levelTarget.textContent = pointToNextLevel
    updateLevelBar()

    const newInterval = (Math.random() * (1.1 - 0.8) + 0.8).toFixed(1)
    intervalSpawnEnemies *= newInterval
    clearInterval(enemiesSpawnerIntervalId);
    spawnEnemies()

    let newIntervalText = ""
    const newIntervalPercent = 1 - newInterval
    if(newIntervalPercent < 0){
        newIntervalText = ` ❗Meteor Interval ${(newIntervalPercent*-100).toFixed(0)}% slower`
    } else if (newIntervalPercent > 0){
        newIntervalText = ` ❗Meteor Interval ${(newIntervalPercent*100).toFixed(0)}% faster`
    }

    const newSpeed = (Math.random() * (1.3 - 0.8) + 0.8).toFixed(1)
    enemiesSpeed *= newSpeed

    const newSpeedPercent = newSpeed - 1

    let newSpeedText = ""
    if(newSpeedPercent < 0){
        newSpeedText = ` ❗Meteor Speed ${(newSpeedPercent*-100).toFixed(0)}% slower`
    } else if (newSpeedPercent > 0){
        newSpeedText = ` ❗Meteor Speed ${(newSpeedPercent*100).toFixed(0)}% faster`
    }

    infoMsg(`${newSpeedText} ${newIntervalText}`)

    new Audio('./assets/sound/level.mp3').play();
}

function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = "rgba(0,0,0,0.1)"
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle, particleIndex) =>{
        if(particle.alpha <= 0){
            particles.splice(particleIndex, 1);
        }else{
            particle.update()
        }
    })
    projectiles.forEach((projectile, projectileIndex)=>{
        projectile.update()
        if( projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height
        ){
            setTimeout(()=>{
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    if(score >= pointToNextLevel){
        newSpeedLevel()
    }

    enemies.forEach((enemy, enemyIndex)=>{
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if(dist - enemy.radius - player.radius < 1){
            infoMsg("Loading...")
            fetchInputPoint()
            cancelAnimationFrame(animationId)
            clearInterval(enemiesSpawnerIntervalId)
            rankContainer.style.display = "block"
            startElement.style.display = "block"
            bottomLeftControl.style.display = "none"
            gameLevelBarContainer.style.display = "none"
            pointStart.textContent = score
            infoMsg("Game Over!")
            showCurrentDisplay()
        }

        projectiles.forEach((projectile, projectileIndex) =>{
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.radius - projectile.radius < 1){

                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 5), y: (Math.random() - 0.5) * (Math.random() * 5)  })) //random segara arah (minus plus)
                }
                if(enemy.radius - 10 > 10){
                    score += 10
                    enemy.radius -= 10
                    gsap.to(enemy, {
                        radius: enemy.radius - 4
                    })
                }else{

                    score += Math.round(enemy.radius);
                    setTimeout(()=>{
                        enemies.splice(enemyIndex, 1)
                    }, 0)
                }

                new Audio('./assets/sound/break.mp3').play();

                levelCurrent.textContent = score
                updateLevelBar()

                setTimeout(()=>{
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            }
        })
    })
}

function fetchInputPoint(){
    const maxRetries = 3;
    let currentRetry = 0;

    function sendRequest() {
        fetch("backend/database.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                IdUser:localStorage.getItem('seputarku_meteor_shooter_username'),
                Point:score,
                action:"input_point"
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        })
        .then((res) => {
            if(res.Success === true){
                updateTopScore()
            }else{
                infoMsg(res.Message)
            }
        })
        .catch((error) => {
            infoMsg(error)
            if (currentRetry < maxRetries) {
                currentRetry++;
                infoMsg(`Error! Retrying (${currentRetry}/${maxRetries})...`);
                sendRequest();
            } else {
                infoMsg(`Max retries reached. Error: ${error}`);
            }
        });
    }
    sendRequest();
}

canvas.addEventListener("click", (event) => {
    handleProjectileLaunch(event.clientX, event.clientY);
});

canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    handleProjectileLaunch(touch.clientX, touch.clientY);
});

function handleProjectileLaunch(x, y) {
    const angle = Math.atan2(y - canvas.height/2, x - canvas.width/2);
    const velocity = {
        x: Math.cos(angle) * projectilesSpeed,
        y: Math.sin(angle) * projectilesSpeed
    };
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, "red", { x: velocity.x, y: velocity.y }));
    new Audio('./assets/sound/shoot.mp3').play();
}


//----------------------------------------------------------

let autoShoot = false
let autoProjectileIntervalId
let mouseX = 0
let mouseY = 0

addEventListener("keydown", event =>{
    if(event.key === "e" && localStorage.getItem('seputarku_meteor_shooter_username')){
        autoProjectile()
    }
})

document.getElementById("autoShootBtn").onclick = () =>{
    autoProjectile()
}

function autoProjectile(){
    if(autoShoot == false){
        enemiesSpeed *= 2
        window.addEventListener("mousemove", MouseLoc)
        autoProjectileIntervalId = setInterval(() =>{
            const angle = Math.atan2(mouseY - canvas.height/2, mouseX - canvas.width/2)
            const velocity = {
                x: Math.cos(angle) * projectilesSpeed,
                y: Math.sin(angle) * projectilesSpeed
            }
            projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, "red", {  x: velocity.x, y: velocity.y  }  ))
        },300)
        autoShoot = true
        infoMsg("Auto fire activated")
    }else{
        enemiesSpeed /= 2
        clearInterval(autoProjectileIntervalId)
        window.removeEventListener("mousemove", MouseLoc)
        autoShoot = false
        infoMsg("Auto fire deactivated")
    }
}

function MouseLoc(event){
    mouseX = event.clientX
    mouseY = event.clientY
}

//----------------------------------------------------------

startGameBtn.onclick = startGame

function startGame(){
    init()
    animate()
    spawnEnemies()
    if(autoShoot){
        clearInterval(autoProjectileIntervalId)
        window.removeEventListener("mousemove", MouseLoc)
        autoShoot = false
    }
    startElement.style.display = "none"
    bottomLeftControl.style.display = "block"
    gameLevelBarContainer.style.display = "block"

    console.log(`
    __  __      _                    ____  _                 _            _ 
    |  \\/  | ___| |_ ___  ___  _ __  / ___|| |__   ___   ___ | |_ ___ _ __| |
    | |\\/| |/ _ \\ __/ _ \\/ _ \\| '__| \\___ \\| '_ \\ / _ \\ / _ \\| __/ _ \\ '__| |
    | |  | |  __/ ||  __/ (_) | |     ___) | | | | (_) | (_) | ||  __/ |  |_|
    |_|  |_|\\___|\\__\\___|\\___/|_|    |____/|_| |_|\\___/ \\___/ \\__\\___|_|  (_)
    `);


}
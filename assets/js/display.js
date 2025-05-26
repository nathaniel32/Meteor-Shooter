const startBoardLog = document.getElementById("startBoardLog")
const startBoardHowToPlay = document.getElementById("startBoardHowToPlay")
const startBoardLastPoint = document.getElementById("startBoardLastPoint")
const msgElement = document.getElementById("msgElement")

function infoMsg(text){
    msgElement.textContent = text
    msgElement.style.display = "block"
    setTimeout(()=>{
        msgElement.style.display = "none"
    }, 2000)
}

function sh_startBoardLog(){
    startBoardLog.style.display = "block"
    startBoardHowToPlay.style.display = "none"
    startBoardLastPoint.style.display = "none"
}

function sh_startBoardHowToPlay(){
    startBoardLog.style.display = "none"
    startBoardHowToPlay.style.display = "block"
    startBoardLastPoint.style.display = "none"
}

function sh_startBoardLastPoint(){
    startBoardLog.style.display = "none"
    startBoardHowToPlay.style.display = "none"
    startBoardLastPoint.style.display = "block"
}

const howToPlayBtn = document.querySelector(".howToPlayBtn")
let howToPlayBtnBoolean = false

howToPlayBtn.onclick = ()=>{
    if(howToPlayBtnBoolean === false){
        sh_startBoardHowToPlay()
        howToPlayBtn.textContent = "back"
    }else{
        showCurrentDisplay()
        howToPlayBtn.textContent = "how to play?"
    }
    howToPlayBtnBoolean = !howToPlayBtnBoolean
}

function showCurrentDisplay(){
    if(localStorage.getItem('seputarku_meteor_shooter_username')){
        sh_startBoardLastPoint()
    }else{
        sh_startBoardLog()
    }
}

const logStartGameBtn = document.getElementById("logStartGameBtn")

logStartGameBtn.onclick = ()=>{
    //make account and play
    const inputUsername = document.getElementById("inputUsername")
    const messageLog = document.querySelector(".messageLog")

    if(inputUsername.value == ""){
        messageLog.textContent = "Please enter your Username"
    }else{
        messageLog.textContent = "Loading..."
        fetch("backend/database.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Username:inputUsername.value,
                action:"make_account"
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.json();
        })
        .then((res) => {
            if(res.Success == true){
                localStorage.setItem('seputarku_meteor_shooter_username', res.Id)
                infoMsg(res.Message)
                startGame()
                messageLog.textContent = "Enter Username"
            }else{
                messageLog.textContent = res.Message
            }
        })
        .catch((error) => {
            messageLog.textContent = error
        });
    }
}

const logout = document.getElementById("BoardLastSetting")

logout.onclick = () => {
    if(confirm("Do you want to logout?")){
        localStorage.removeItem('seputarku_meteor_shooter_username')
        showCurrentDisplay()
        updateTopScore()
        infoMsg("Logged Out Successfuly!")
    }
}

//--------------------

const tableElement = document.getElementById("scoreList")

let scoresArray = []

function updateTopScore(){
    /* tableElement.textContent = "" */
    fetchTopUser()
}

function fetchTopUser(){
    fetch("backend/database.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action:"update_top_score"
        }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json()
    })
    .then((res) => {
        if(res.Success == true){
            scoresArray = res.Data
            tableElement.textContent = ""
            if(scoresArray.length == 0){
                let trBody = document.createElement("tr")
                trBody.className = "trBody"

                let Td1Table = document.createElement("td")
                Td1Table.className = "pointTopScoreGuest"
                Td1Table.appendChild(document.createTextNode("----"))

                let Td2Table = document.createElement("td")
                Td2Table.className = "pointTopScoreGuest"
                Td2Table.appendChild(document.createTextNode("--------"))
                
                let Td3Table = document.createElement("td")
                Td3Table.className = "pointTopScoreGuest"
                Td3Table.appendChild(document.createTextNode("-------"))

                trBody.appendChild(Td1Table)
                trBody.appendChild(Td2Table)
                trBody.appendChild(Td3Table)

                tableElement.appendChild(trBody)
            }else{
                let isTop5 = false
                let printCount
                
                if(innerWidth > 600){
                    printCount = Math.min(5, scoresArray.length)
                }else{
                    printCount = Math.min(3, scoresArray.length)
                }
                
                for (let i = 0; i < printCount; i++) {
                    let trBody = document.createElement("tr")
                    trBody.className = "trBody"

                    let Td1Table = document.createElement("td")
                    let Td2Table = document.createElement("td")
                    let Td3Table = document.createElement("td")

                    if(scoresArray[i].id_u == localStorage.getItem('seputarku_meteor_shooter_username')){
                        Td1Table.className = "nrTopScoreYou"
                        Td2Table.className = "pointTopScoreYou"
                        Td3Table.className = "pointTopScoreYou"
                        isTop5 = true
                    }else{
                        Td1Table.className = "nrTopScore"
                        Td2Table.className = "pointTopScoreGuest"
                        Td3Table.className = "pointTopScoreGuest"
                    }

                    Td1Table.appendChild(document.createTextNode(i+1))
                    Td2Table.appendChild(document.createTextNode(scoresArray[i].username_u))
                    Td3Table.appendChild(document.createTextNode(scoresArray[i].point_p))

                    trBody.appendChild(Td1Table)
                    trBody.appendChild(Td2Table)
                    trBody.appendChild(Td3Table)

                    tableElement.appendChild(trBody)
                }
                //console.log("+")
                //------------------------currentuser
                if(isTop5 == false && localStorage.getItem('seputarku_meteor_shooter_username')){
                    fetchCurrentUser()
                    //console.log("-")
                }
            }
        }else{
            infoMsg(res.Message)
        }
    })
    .catch((error) => {
        infoMsg("Error: "+error)
        //---
        /* let trBody = document.createElement("tr")
        trBody.className = "trBody"

        let Td1Table = document.createElement("td")
        Td1Table.className = "pointTopScoreGuest"
        Td1Table.appendChild(document.createTextNode("----"))

        let Td2Table = document.createElement("td")
        Td2Table.className = "pointTopScoreGuest"
        Td2Table.appendChild(document.createTextNode("--------"))
        
        let Td3Table = document.createElement("td")
        Td3Table.className = "pointTopScoreGuest"
        Td3Table.appendChild(document.createTextNode("-------"))

        trBody.appendChild(Td1Table)
        trBody.appendChild(Td2Table)
        trBody.appendChild(Td3Table)

        tableElement.appendChild(trBody) */
    })
}

function fetchCurrentUser(){
    fetch("backend/database.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            IdUser:localStorage.getItem('seputarku_meteor_shooter_username'),
            action:"update_top_score_you"
        }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json()
    })
    .then((res) => {
        if(res.Success == true){
            //infoMsg(res.Message)

            let trBody = document.createElement("tr")
            trBody.className = "trBody"

            let Td1Table = document.createElement("td")
            Td1Table.className = "nrTopScoreYou"
            Td1Table.appendChild(document.createTextNode(res.Data.rank_number))

            let Td2Table = document.createElement("td")
            Td2Table.className = "pointTopScoreYou"
            Td2Table.appendChild(document.createTextNode(res.Data.username_u))
            
            let Td3Table = document.createElement("td")
            Td3Table.className = "pointTopScoreYou"
            Td3Table.appendChild(document.createTextNode(res.Data.point_p))

            trBody.appendChild(Td1Table)
            trBody.appendChild(Td2Table)
            trBody.appendChild(Td3Table)

            tableElement.appendChild(trBody)
        }else{
            infoMsg(res.Message)
        }
    })
    .catch((error) => {
        infoMsg(error)
    })
}

//------------------

showCurrentDisplay()
updateTopScore()
let {ipcRenderer}= require("electron");



let form = document.querySelector("form");

form.addEventListener("submit",function(e){
    console.log("ffffffffffffffffffffff");
 e.preventDefault();

 let note=document.querySelector(".note").value,
    pickeHoures = document.querySelector(".pick-hours").value*3600000,
    
    pickMinute = document.querySelector(".pick-minutes").value*60000,
    
    noteficationDate= Date.now();
    noteficationDate+=(pickeHoures+pickMinute);
    noteficationDate= new Date(noteficationDate);
    ipcRenderer.send("add-timed-note",note,noteficationDate);

})







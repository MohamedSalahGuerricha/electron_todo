const {ipcRenderer}=require("electron");
const fs = require("fs");
const  connection = require("./connection");

let newImaged = document.querySelector(".todo--images .add-new-task");

newImaged.addEventListener("click",()=>{

    ipcRenderer.send("new-imaged");

})

ipcRenderer.on("add_imaged-task", function(e,note,imgURI){
    try{
addImagedTask(note,imgURI);
    }catch{
        console.log("I cant add it");
    }

});

function addImagedTask(note,imgURI) {
  connection.insert({
      into : "imaged",
      values: [{
          note : note,
          img_uri : imgURI
      }]
  }).then(()=>showImaged());

}

function deleteTaskImaged(taskId,imgURI){
    if(imgURI){
        fs.unlink(imgURI,(err)=>{
            if(err){
                console.log(err);
                return ;
            }
        });
    }
    connection.remove({
     from:"imaged",
     where : {
         id:taskId
     }

    }).then(()=>showImaged());
}

function updateTaskImaged(taskId,taskValue){
connection.update({
    in : "imaged",
    where : {
        id : taskId
    },
    set : {
     note : taskValue
    }
}).then(()=>showImaged());

}

function showImaged(){
let clearImagedBTN = document.querySelector(".todo--images .clear-all");    
let imagedList = document.querySelector('.todo--images__list');
imagedList.innerHTML = "";
connection.select({
    from:"imaged"  
}).then((tasks)=>{
    if(tasks.length === 0 ){
        imagedList.innerHTML="<li class='empty-list'>لاتوجد مهام </li>"

        clearImagedBTN.classList.remove("clear-all--show");

        } else {
            clearImagedBTN.classList.add("clear-all--show");

        clearImagedBTN.addEventListener("click",function(){
            return connection.remove({
                from:"imaged"
            }).then(()=>showImaged());
        })
        for(let task of tasks){
            clearImagedBTN.addEventListener("click",()=>{
                fs.unlink(task.img_uri,(err)=>{
                    if(err){
                        console.log(err)
                        return;
                    }
             
                })
               
            })

            let  listItem = document.createElement('li'),
                 taskinput = document.createElement('input'),
                 imageHolder = document.createElement('div'),
                 taskImage = document.createElement('img'),
                 deleteBTN = document.createElement('button'),
                 buttonHolder = document.createElement('div'),
                 noteContentHolder = document.createElement('div'),
                 updateBTN = document.createElement('button'),
                 exportBTN = document.createElement('button');




                 taskinput.value=task.note;
                 buttonHolder.classList.add("buttons-holder");

                 deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                 taskImage.setAttribute("src",task.img_uri);

                 deleteBTN.addEventListener("click",()=>{
                     deleteTaskImaged(task.id,task.img_uri);
                 });
                 updateBTN.addEventListener("click",()=>{
                     updateTaskImaged(task.id,taskinput.value);
                 });
                 exportBTN.addEventListener("click",()=>{
                     ipcRenderer.send("creat-task",task.note);
                 })

                 
                 buttonHolder.appendChild(deleteBTN);
                 buttonHolder.appendChild(updateBTN);
                 buttonHolder.appendChild(exportBTN);
                 noteContentHolder.appendChild(taskinput);
                 noteContentHolder.appendChild(buttonHolder);
                 imageHolder.appendChild(taskImage);
                 listItem.appendChild(noteContentHolder);
                 listItem.appendChild(imageHolder);
                 imagedList.appendChild(listItem);
        } 
    }
})

}

showImaged();
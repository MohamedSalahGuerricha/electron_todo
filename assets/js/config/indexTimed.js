const { ipcRenderer } = require("electron");
const connection = require("./connection");


//////////////////////////////////////////

let addTimedBTN = document.querySelector(".todo--timed .add-new-task");
addTimedBTN.addEventListener("click", function () {

   // Swal.fire('Any fool can use a computer')
    
    ipcRenderer.send("new-timed");
});

ipcRenderer.on("add-timed-note", function (e, note, noteficationTime) {
    addTimedTask(note, noteficationTime);
});
function addTimedTask(task, noteficationTime) {
    connection.insert({

        into: "timed",
        values: [{
            note: task,
            pick_status: 0,
            pick_time: noteficationTime
        }



        ]
    }).then(() => showTimed());

}

function deleteTimedTask(taskId){
connection.remove({
from : "timed",
where:{
    id: taskId
}

}).then(()=>showTimed());

}
function updatTimedTask(noteId,taskValue){
    connection.update({
      in:'timed',
      where : {
          id : noteId
      },
      set : {
          note : taskValue
          
      }

    }).then(()=>showTimed());
}

function showTimed() {                      
    let timedlist = document.querySelector(".todo--timed__list");
    let clearTimedBtn = document.querySelector(".todo--timed .clear-all");
    timedlist.innerHTML = "";
    connection.select({
        from: "timed"
    }).then((tasks) => {
        if (tasks.length === 0) {
            timedlist.innerHTML = "<li class='empty-list'>لا توجد مهام </li>";
            clearTimedBtn.classList.remove("clear-all--show");

        } else {
            clearTimedBtn.classList.add("clear-all--show");
clearTimedBtn.addEventListener("click",()=>{

    return connection.remove({
from:'timed'
    }).then(()=>showTimed());

});
            for (let task of tasks) {
                let listItem = document.createElement("li"),
                    taskInput = document.createElement("input"),
                    timeHolder = document.createElement("div"),
                    deleteBTN = document.createElement("button"),
                    updateBTN = document.createElement("button"),
                    exportBTN = document.createElement("button"),
                    buttonHolder= document.createElement("div");

                    deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                    updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                    exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";
                   
                timeHolder.classList.add("time-holder");
                buttonHolder.classList.add("buttons-holder");
                taskInput.value = task.note;
                updateBTN.addEventListener("click",function(){
                    updatTimedTask(task.id,taskInput.value);
                });
                deleteBTN.addEventListener("click",function(){
                    deleteTimedTask(task.id);
                });
                exportBTN.addEventListener("click",()=>{

                    ipcRenderer.send("creat-task",task.note,task);
                })
                

               
               
                if(task.pick_status === 1){                           
                 timeHolder.innerHTML="جرى التنبيه" + task.pick_time.toLocaleTimeString();
                }else{
                  timeHolder.innerHTML="سيتم التذكير في "+task.pick_time.toLocaleTimeString();
                }
                

                let checkInterval = setInterval(() => {
                    let curentDate = new Date();

                    if (task.pick_time.toString() === curentDate.toString()) {
                        connection.update({
                            in: "timed",
                            where: {
                                id: task.id
                            },
                            set: {
                                pick_status: 1
                            }
                        }).then(() => showTimed);
                        console.log("جاري التصدير" + task.note);
                        ipcRenderer.send("notify", task.note);

                        clearInterval(checkInterval);

                    }

                }, 1000); // هنا تم تحديد مجال التحديث كل 1000 م,ث


                buttonHolder.appendChild(deleteBTN);
                buttonHolder.appendChild(updateBTN);
                buttonHolder.appendChild(exportBTN);
                
                
               
                listItem.appendChild(taskInput);
                listItem.appendChild(timeHolder);
                listItem.appendChild(buttonHolder);
                timedlist.appendChild(listItem);

            }

        }
    });


}
showTimed();





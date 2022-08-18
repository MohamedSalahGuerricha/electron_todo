const { ipcRenderer } = require('electron');
const connection = require("./connection");

ipcRenderer.on("add-normal-task", function (e, task) {
    addNormalTask(task);

});
let addNormalBTN = document.querySelector(".todo--normal .add-new-task");
addNormalBTN.addEventListener("click", function () {
    
    ipcRenderer.send("new-normal")
});
function addNormalTask(task) {
    connection.insert({
        into: "tasks",
        values: [{
            note: task,

        }]

    }).then(() => showNormal());



}
function deleteTask(taskId) {
    return connection.remove({
        from: "tasks",
        where: { id: taskId }
    }).then(() => showNormal());


}
function updateTask(taskId, taskValue) {
    
    connection.update({
        in: "tasks",
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }

    }).then(console.log("ffffff"));
}
function showNormal() {
    let clearNormalBTN = document.querySelector(".todo--normal .clear-all");
    let normalTasksList = document.querySelector(".todo--normal__list");
    normalTasksList.innerHTML = "";
    connection.select({
        from: `tasks`
    }).then((tasks) => {
        if (tasks.length === 0) {
            normalTasksList.innerHTML = "<li class='empty-list'>لا توجد مهام </li>";
            clearNormalBTN.classList.remove("clear-all--show"); // تم اضافتها في درس التنسيقات العامه للتطبيق 11:30
        } else {
            clearNormalBTN.classList.add("clear-all--show");
            clearNormalBTN.addEventListener("click", function () {
                connection.remove({
                    from: "tasks"
                }).then(() => { showNormal() });
            });
            for (let task of tasks) {  //** tasks هي عمود في الجدول task */ 
                let listItem = document.createElement("li"),
                    taskInput = document.createElement("input"),
                    deleteBTN = document.createElement("button"),
                    updateBTN = document.createElement("button"),
                    exportBTN = document.createElement("button"),

                    buttonHolder = document.createElement("div");
                buttonHolder.classList.add("buttons-holder");
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";


                deleteBTN.addEventListener("click", () => { deleteTask(task.id); });
                updateBTN.addEventListener("click", () => { updateTask(task.id, taskInput.value) });
                exportBTN.addEventListener("click", () => { ipcRenderer.send("creat-task", task.note) });

                taskInput.value = task.note;
                buttonHolder.appendChild(deleteBTN);
                buttonHolder.appendChild(updateBTN);
                buttonHolder.appendChild(exportBTN);
                listItem.appendChild(taskInput);
                listItem.appendChild(buttonHolder);
                normalTasksList.appendChild(listItem);

            }
        }
    })

}
showNormal();





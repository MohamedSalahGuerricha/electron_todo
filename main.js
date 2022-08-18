const { app, BrowserWindow, Menu, ipcMain, dialog,Notification,Tray } = require("electron");
const fs = require("fs");
const path = require("path");
const appPath= app.getPath("userData");

//const Alert = require("electron-alert");

let mainWindow;
let addWindow;
let addTimeWindow;
let addImageWindow;
let tray =null;


app.on("ready", function () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }

    });
    mainWindow.loadFile("index.html");
    
    console.log(appPath);

    mainWindow.on("closed", function () {
        app.quit();
    });
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on("minimize",function(event){//ا10-اظهار ايقونة التطبيق لتظهر في شريط المهام عند تصغير التطبيق 02:30

        event.preventDefault();
        mainWindow.hide();
        tray= createTray();
    });
    mainWindow.on("restore",function(event){
        mainWindow.show();
        tray.destroy();
    });

   

});

function createTray(){
    let iconPath = path.join(__dirname,"./assets/images/icon.png");
    let appIcon= new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate(iconMenuTemplate);
    appIcon.on("double-click",function(event){
        mainWindow.show();
    });

    appIcon.setToolTip("تطبيق ادارة المهام ");
    appIcon.setContextMenu(contextMenu);
    return appIcon;
}
const iconMenuTemplate =[ {
    label: "فتح",
    click(){
        mainWindow.show();
    }
},
{
    label : "إغلاق",
    click(){
        app.quit();
    }
}
]

const mainMenuTemplate = [    {
        label: "القائمه",
        submenu: [
            {
                label: "إضافة مهمة",
                click() {
                    iniAddWindow();
                }

            },
            {
                label: " إضافة مهمة مؤقته",
                click() {
                    creatTimeWindow();
                }

            },
            {
                label: "اضافة مهمة بصوره",
                click(){
                    createImageWindow();
                }
            },
            {
                label: "خروج",
                accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
                click() {
                    app.quit();
                }
            }

        ]
    }
    
];
// 01:50 ه10-هذا الأمر لحل مشكلة ظهور فراغ في أعلى القائمه على أجهزة الماك 
if (process.platform==="darwin"){ //  ترمز الى أجهزة الماك darwin  ا10-الشرط لتحديد نوع بيئة العمل 

    mainMenuTemplate.unshift({}); // حذف أزل عنصر من مصفوفة القائمه الرئيسيه
}
// 00:30 ه10-هذا الشرط للتحقق من التطبيق هل هو في مرحلة التطوير ان تم تصديره من أجل اخفاء واظهار ادزات المطور
process.env.NODE_ENV ="devlopment";
// هذا الشرط للتحقق من التطبيق هل هو في مرحلة التطوير ان تم تصديره من أجل اخفاء واظهار ادزات المطور
if (process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push(
        {
        label: "ادوات المطور",
        submenu: [
            {
                label: "فتح أدوات المطور",
                accelerator: process.platform === "darwin" ? "cmd + D" : "Ctrl + D",
                click() {
                    mainWindow.toggleDevTools();

                }
            },
            {
                label: "إعادة تحميل التطبيق",
                role: "reload"
            }
        ]
    }
    )
}




// خاص بالمهمة العاديه
function iniAddWindow() {
    addWindow = new BrowserWindow({
        width: 400,
        height: 250,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }

    });
    addWindow.loadFile("./view/normalTask.html");
    addWindow.on("closed", (e) => {
        e.preventDefault();
        addWindow = null;
    });

    addWindow.removeMenu();

}
ipcMain.on("add-normal-task", function (e, item) {
    mainWindow.webContents.send("add-normal-task", item);
    addWindow.close();
});
ipcMain.on("new-normal", function (e) { iniAddWindow() });
ipcMain.on("creat-task", function (e, note) {
    let dest = Date.now() + "-task.txt";
    dialog.showSaveDialog({
        title: "اختار حفظ الملف",
        defaultPath: path.join(__dirname, "./" + dest),
        buttonLabel: "save",
        filters: [
            {
                name: "Text Files salah ",
                extensions: ["txt","pdf"]
            }
            
        ]
    }).then(file => {
        if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), note, function (err) { if (err) throw err });
        }
    }).catch(err => { console.log(err) });


});
function creatTimeWindow() {
    
    addTimeWindow = new BrowserWindow({ width: 400, high: 250, webPreferences: { nodeIntegration: true, webContents: false,contextIsolation:false } });
    addTimeWindow.loadFile(path.join(__dirname, "./view/timedTask.html"));
    addTimeWindow.on("closed", (e) => {
        e.preventDefault();
        addTimeWindow = null;
    }
    );
    addTimeWindow.removeMenu();
}
// خاص بالمهمة المؤقته
ipcMain.on("add-timed-note",function(e,note,noteficationTime){// استقبال من سكريبت و التحويل للاندكس
    mainWindow.webContents.send("add-timed-note",note,noteficationTime);
    addTimeWindow.close();
});
//     // indexTimed.js من ال   notify استقبال الحدث 
ipcMain.on("notify",function(e,taskValue){
new Notification({
    title:"لديك تنبيه من مهامك",
    body: taskValue,
    icon: path.join(__dirname,"./assets/images/err.png")
}).show();

console.log(" انتهى التنبيه")

});
ipcMain.on("new-timed",function(e){

creatTimeWindow();

});
// خاص بالمهمة المصوره
function createImageWindow(){
    addImageWindow = new BrowserWindow({
        width: 400,
        height: 420,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });
    addImageWindow.loadFile(path.join(__dirname,"./view/imagedTask.html"));

   // addImageWindow.toggleDevTools();
    //mainWindow.toggleDevTools();

    addImageWindow.on("closed",(e)=>{
        e.preventDefault();
        addImageWindow=null;
    });
    addImageWindow.removeMenu();
   
}
ipcMain.on("upload-image",function(event){
    console.log("I resived render");
dialog.showOpenDialog({
    properties: ["openFile"],
    filters:[
        {name:"images",extensions:["jpg","png","gif"]}
    ]

}).then(result => {
    event.sender.send("open-file",result.filePaths,appPath);
    console.log(result.filePaths);
})

});
ipcMain.on("add_imaged-task",function(e,note,imgURI){

    mainWindow.webContents.send("add_imaged-task",note,imgURI);
    addImageWindow.close();
});
ipcMain.on("new-imaged",(e)=>{
    createImageWindow();
})

//----------- miniPandA setting --------------//
let header_list = ["締め切り２４時間以内", "締め切り５日以内", "締め切り１４日以内", "その他"];
let header_color = ["danger", "warning", "success", "other"];
let initLetter = ["a", "b", "c", "d"];

var header = document.createElement('div');
var header_title = document.createElement('span');
header_title.className = "q";
var list_container = document.createElement('div');
list_container.className = "sidenav-list";
var list_body = document.createElement('div');
var h2 = document.createElement('h2');

var p_chkbox = document.createElement('input');
p_chkbox.type = "checkbox";
p_chkbox.className = "todo-check";
var p_label = document.createElement('label');
var p_date = document.createElement('p');
p_date.className = "kadai-date";
var remain = document.createElement('span');
remain.className = "time-remain";
var p_title = document.createElement('p');
p_title.className = "kadai-title";

//----------- miniPandA setting --------------//
function insertCSS() {
    let css = document.createElement('link');
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = chrome.extension.getURL('css/custom-panda.css');
    document.body.appendChild(css);
}

function insertJS() {
    let js = document.createElement('script');
    js.textContent = "let btn = document.getElementById('close_btn');\n" +
        "btn.onclick = toggleNav;\n" +
        "let ham = document.getElementById('hamburger');\n" +
        "ham.onclick = toggleNav;\n" +
        "\n" +
        "let toggle = false;\n" +
        "function toggleNav() {\n" +
        "    if (toggle) {\n" +
        "        document.getElementById(\"mySidenav\").style.width = \"0\";\n" +
        "        document.getElementById(\"cover\").remove();\n" +
        "    } else {\n" +
        "        document.getElementById(\"mySidenav\").style.width = \"300px\";\n" +
        "        let cover = document.createElement(\"div\");\n" +
        "        cover.id=\"cover\";\n" +
        "        document.getElementsByTagName(\"body\")[0].appendChild(cover);\n" +
        "        cover.onclick = toggleNav;\n" +
        "    }\n" +
        "    toggle = 1 - toggle;\n" +
        "}";
    try {
        document.head.appendChild(js);
    } catch (e) {
        console.log("error");
    }

}

function parseID(lectureIDList) {
    let idList = {};
    for (let i = 0; i < lectureIDList.length; i++) {
        let id = lectureIDList[i].lectureID;
        idList[id] = lectureIDList[i].lectureName;
    }
    // console.log(idList);
    return idList;
}

function sortKadai(parsedKadai) {
    // console.log("s", parsedKadai.length);
    for (let i = 0; i < parsedKadai.length; i++) {
        let kadaiList = parsedKadai[i].kadaiList;
        kadaiList.sort(function (a, b) {
            if (a.dueTimeStamp < b.dueTimeStamp) return -1;
            if (a.dueTimeStamp > b.dueTimeStamp) return 1;
            if (a.kadaiTitle < b.kadaiTitle) return -1;
            if (a.kadaiTitle > b.kadaiTitle) return 1;
            return 0;
        });
        // console.log(i, kadaiList);
        parsedKadai[i].kadaiList = kadaiList;
    }
    return parsedKadai;
}

function genUniqueStr() {
    return new Date().getTime().toString(16) + Math.floor(123456 * Math.random()).toString(16);
}

function getTimeRemain(_remainTime) {
    let day = Math.floor(_remainTime / (3600 * 24));
    let hours = Math.floor((_remainTime - (day * 3600 * 24)) / 3600);
    let minutes = Math.floor((_remainTime - (day * 3600 * 24 + hours * 3600)) / 60);

    return [day, hours, minutes]

}

function toggleKadaiTab() {
    let kadaiTab = document.querySelector('.kadai-tab');
    kadaiTab.style.display = '';
    let examTab = document.querySelector('.exam-tab');
    examTab.style.display = 'none';
}

function toggleExamTab() {
    let kadaiTab = document.querySelector('.kadai-tab');
    kadaiTab.style.display = 'none';
    let examTab = document.querySelector('.exam-tab');
    examTab.style.display = '';
    loadExamfromStorage();
}

function addMemo(kadaiMemo) {
    let idList = parseID(getTabList());
    //Delete old
    let oldMemo = document.querySelectorAll('.todoMemo');
    oldMemo.forEach((item) => {
        item.remove()
    })

    for (let i = 0; i < 4; i++) {
        for (let row = 0; row < kadaiMemo.length; row++) {
            let kadaiMemoList = kadaiMemo[row].kadaiList;
            let lectureID = kadaiMemo[row].lectureID;
            for (let memo = 0; memo < kadaiMemoList.length; memo++) {

                let dueTime = kadaiMemoList[memo].dueTimeStamp;
                let kid = kadaiMemoList[memo].kid;
                let kadaiTitle = kadaiMemoList[memo].kadaiTitle;

                let daysUntilDue = diffDays(new Date().getTime(), dueTime);
                if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue > 5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && daysUntilDue <= 1000 &&i === 3)) {
                    let kadaiTodoDiv = document.querySelector(`#${initLetter[i]}${lectureID}`);

                    let chkbox = p_chkbox.cloneNode(true);
                    let label = p_label.cloneNode(true);
                    let date = p_date.cloneNode(true);
                    let remain_time = remain.cloneNode(true);
                    let title = p_title.cloneNode(true);

                    let _date = new Date(dueTime);
                    let dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ('00' + _date.getMinutes()).slice(-2);
                    let timeRemain = getTimeRemain((dueTime - new Date().getTime()) / 1000);

                    if (kadaiTodoDiv === null) {
                        let C_list_body = list_body.cloneNode(true);
                        C_list_body.className = `kadai-${header_color[i]}`;
                        C_list_body.classList.add("todoMemo");
                        C_list_body.id = initLetter[i] + lectureID;

                        let lectureName = idList[lectureID];
                        if (lectureName === undefined) lectureName = lectureID;

                        let C_h2 = h2.cloneNode(true);
                        C_h2.className = `lecture-${header_color[i]}`;
                        C_h2.textContent = "" + lectureName;
                        C_list_body.appendChild(C_h2);
                        // search for appropriate place to append

                        let parent = document.querySelector(`.sidenav-list-${header_color[i]}`);
                        parent.appendChild(C_list_body);
                        parent.style.display="";
                        let header = document.querySelector(`.sidenav-${header_color[i]}`);
                        header.style.display="";
                        kadaiTodoDiv = document.querySelector(`#${initLetter[i]}${lectureID}`);//todo 不安

                    }

                    // if (kadaiTodoDiv !== null) {
                        date.textContent = "" + dispDue;
                        remain_time.textContent = `あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;
                        title.innerHTML = "<span class=\"add-badge add-badge-success\">個人用</span>" + kadaiTitle;
                        // const q = kadaiListAll.findIndex((kadai) => {
                        //     return (kadai.kid === kid);
                        // });
                        // if (q !== -1) {
                        //     if (kadaiListAll[q].isFinished === 1) chkbox.checked = true;
                        // }
                        chkbox.id = kid;
                        chkbox.lectureID = lectureID;
                        // chkbox.addEventListener('change', updateKadaiTodo, false);
                        label.htmlFor = kid;

                        //add memo tag
                        chkbox.classList.add("todoMemo");
                        label.classList.add("todoMemo");
                        date.classList.add("todoMemo");
                        remain_time.classList.add("todoMemo");
                        title.classList.add("todoMemo");
                        kadaiTodoDiv.appendChild(chkbox);
                        kadaiTodoDiv.appendChild(label);
                        kadaiTodoDiv.appendChild(date);
                        kadaiTodoDiv.appendChild(remain_time);
                        kadaiTodoDiv.appendChild(title);
                    // }
                }
            }
        }
    }

}

function todoAdd(event) {
    let selectedIdx = document.querySelector(".todoLecName").selectedIndex;
    let todoLecID = document.querySelector(".todoLecName").options[selectedIdx].id;
    let todoContent = document.querySelector(".todoContent").value;
    let todoDue = document.querySelector(".todoDue").value;
    let todoTimestamp= new Date(`${todoDue}`).getTime();
    // console.log(todoLecID, todoContent, todoDue);
    getFromStorage('kadaiMemo').then(function (kadaiMemo) {
        let ll;
        if (typeof kadaiMemo !== 'undefined' && kadaiMemo.length > 0) {
            let cnt = 0;
            // for (let i = 0; i < kadaiMemo.length; i++) {
                const q = kadaiMemo.findIndex((item) => {
                    return (item.lectureID === todoLecID);
                });
                if (q !== -1) {
                    // console.log(kadaiMemo[q].kadaiList);
                    kadaiMemo[q].kadaiList.push({
                        kid: genUniqueStr(),
                        dueTimeStamp: todoTimestamp,
                        kadaiTitle: todoContent
                    });
                }else{
                        let kadaiList = [{kid: genUniqueStr(), dueTimeStamp: todoTimestamp, kadaiTitle: todoContent}];
                        let kadai = {lectureID: todoLecID, kadaiList: kadaiList};
                        kadaiMemo.push(kadai);
                }
                // } else {
                //     cnt++;
                //     // let kadaiList=[{kid:genUniqueStr(), dueTimeStamp:1593676800000, kadaiTitle:todoContent}];
                //     // let kadai={lectureID:todoLecID,kadaiList:kadaiList};
                //     // kadaiMemo.push(kadai);
                // }
            // }
            // if (cnt === kadaiMemo.length) {
            //     let kadaiList = [{kid: genUniqueStr(), dueTimeStamp: todoTimestamp, kadaiTitle: todoContent}];
            //     let kadai = {lectureID: todoLecID, kadaiList: kadaiList};
            //     kadaiMemo.push(kadai);
            // }
            ll = kadaiMemo;
        } else {
            let kadaiList = [{kid: genUniqueStr(), dueTimeStamp: todoTimestamp, kadaiTitle: todoContent}];
            let kadaiMemo = [{lectureID: todoLecID, kadaiList: kadaiList}];
            ll = kadaiMemo;
        }
        addMemo(ll);
        // Save
        let entity = {};
        entity.kadaiMemo = ll;
        console.log(ll);
        chrome.storage.local.set(entity, function () {
            console.log('stored kadaiMemo');
        });

    });

}



function insertSideNav(parsedKadai, kadaiListAll, lectureIDList) {
    let idList = parseID(lectureIDList);
    parsedKadai = sortKadai(parsedKadai);

    // add hamburger
    let topbar = document.getElementById("mastHead");
    let hamburger = document.createElement('span');
    hamburger.id = "hamburger";
    hamburger.textContent = "☰";
    try {
        topbar.appendChild(hamburger);
    } catch (e) {
        console.log("error")
    }

    var parent = document.getElementById('container');
    var ref = document.getElementById('toolMenuWrap');
    var main_div = document.createElement('div');
    main_div.classList.add("sidenav");
    main_div.classList.add("cp_tab");
    main_div.id = "mySidenav";

    var img = chrome.extension.getURL("img/logo.png");
    let logo = document.createElement("img");
    logo.className = "logo";
    logo.alt = "logo";
    logo.src = img;

    var a = document.createElement('a');
    a.href = '#';
    a.id = "close_btn";
    a.classList.add("closebtn");
    a.classList.add("q");
    a.textContent = "×";

    let kadaiTab = document.createElement('input');
    kadaiTab.type = 'radio';
    kadaiTab.name = 'cp_tab';
    kadaiTab.id = 'kadaiTab';
    kadaiTab.addEventListener('click', toggleKadaiTab);
    kadaiTab.checked = true;
    let kadaiTabLabel = document.createElement('label');
    kadaiTabLabel.htmlFor = 'kadaiTab';
    kadaiTabLabel.innerText = '課題一覧';
    let examTab = document.createElement('input');
    examTab.type = 'radio';
    examTab.name = 'cp_tab';
    examTab.id = 'examTab';
    examTab.addEventListener('click', toggleExamTab);
    examTab.checked = false;
    let examTabLabel = document.createElement('label');
    examTabLabel.htmlFor = 'examTab';
    examTabLabel.innerText = 'テスト・クイズ一覧';

    let kadaiDiv = document.createElement('div');
    kadaiDiv.className = "kadai-tab";
    let examDiv = document.createElement('div');
    examDiv.className = "exam-tab";

    main_div.appendChild(logo);
    main_div.appendChild(a);
    main_div.appendChild(kadaiTab);
    main_div.appendChild(kadaiTabLabel);
    main_div.appendChild(examTab);
    main_div.appendChild(examTabLabel);

    // add edit box
    let examBox = document.createElement('div');
    examBox.className = "examBox";
    let todo_label = document.createElement('label');
    todo_label.style.display = "block";

    let todoLecLabel = todo_label.cloneNode(true);
    todoLecLabel.innerText = "講義名";
    let todoLecSelect = document.createElement('select');
    todoLecSelect.className = "todoLecName";
    let todoLecOption = document.createElement('option');
    // todoLecOption.className="todoLecName";

    for (let i = 0; i < 5; i++) {
        let c_todoLecOption = todoLecOption.cloneNode(true);
        c_todoLecOption.value = "" + i;
        c_todoLecOption.text = "電気電子回路" + i;
        c_todoLecOption.id = "2020-888-N124-007";
        todoLecSelect.appendChild(c_todoLecOption);
    }
    todoLecLabel.appendChild(todoLecSelect);

    let todoContentLabel = todo_label.cloneNode(true);
    todoContentLabel.innerText = "メモ";
    let todoContentInput = document.createElement('input');
    todoContentInput.className = "todoContent";
    todoContentInput.type = "text";
    todoContentLabel.appendChild(todoContentInput);

    let todoDueLabel = todo_label.cloneNode(true);
    todoDueLabel.innerText = "期限";
    let todoDueInput = document.createElement('input');
    todoDueInput.type = "datetime-local";
    todoDueInput.className = "todoDue";
    todoDueInput.value = "2020-06-12T19:30";
    todoDueLabel.appendChild(todoDueInput);

    let todoSubmitButton = document.createElement('button');
    todoSubmitButton.type = "submit";
    todoSubmitButton.id = "todo-add";
    todoSubmitButton.innerText = "追加";
    todoSubmitButton.addEventListener('click', todoAdd, true);

    examBox.appendChild(todoLecLabel);
    examBox.appendChild(todoContentLabel);
    examBox.appendChild(todoDueLabel);
    examBox.appendChild(todoSubmitButton);

    kadaiDiv.appendChild(examBox);
    // add edit box


    // generate kadai todo list
    for (let i = 0; i < 4; i++) {
        let item_cnt = 0;
        // header begin //
        var C_header = header.cloneNode(true);
        var C_header_title = header_title.cloneNode(true);
        C_header.className = `sidenav-${header_color[i]}`;
        C_header.style.display = "none";
        C_header_title.textContent = `${header_list[i]}`;
        // header end //

        // list begin //
        var C_list_container = list_container.cloneNode(true);
        C_list_container.classList.add(`sidenav-list-${header_color[i]}`);
        C_list_container.style.display = "none";
        for (let item = 0; item < parsedKadai.length; item++) {
            let kadaiList = parsedKadai[item].kadaiList;
            let lectureID = parsedKadai[item].lectureID;

            var C_list_body = list_body.cloneNode(true);
            C_list_body.className = `kadai-${header_color[i]}`;
            C_list_body.id = initLetter[i] + lectureID;

            let lectureName = idList[lectureID];
            if (lectureName === undefined) lectureName = "不明";

            var C_h2 = h2.cloneNode(true);
            C_h2.className = `lecture-${header_color[i]}`;
            C_h2.textContent = "" + lectureName;
            C_list_body.appendChild(C_h2);

            let cnt = 0;
            for (let id = 0; id < kadaiList.length; id++) {
                let chkbox = p_chkbox.cloneNode(true);
                let label = p_label.cloneNode(true);
                let date = p_date.cloneNode(true);
                let remain_time = remain.cloneNode(true);
                let title = p_title.cloneNode(true);

                let dueTime = kadaiList[id].dueTimeStamp;
                let _date = new Date(dueTime);
                let kid = kadaiList[id].kid;
                let kadaiTitle = kadaiList[id].kadaiTitle;
                let dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ('00' + _date.getMinutes()).slice(-2);
                let timeRemain = getTimeRemain((dueTime - new Date().getTime()) / 1000);

                let daysUntilDue = diffDays(new Date().getTime(), dueTime);
                if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue > 5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && i === 3)) {
                    date.textContent = "" + dispDue;
                    remain_time.textContent = `あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;
                    title.textContent = "" + kadaiTitle;
                    const q = kadaiListAll.findIndex((kadai) => {
                        return (kadai.kid === kid);
                    });
                    if (q !== -1) {
                        if (kadaiListAll[q].isFinished === 1) chkbox.checked = true;
                    }
                    chkbox.id = kid;
                    chkbox.lectureID = lectureID;
                    chkbox.addEventListener('change', updateKadaiTodo, false);
                    label.htmlFor = kid;
                    C_list_body.appendChild(chkbox);
                    C_list_body.appendChild(label);
                    C_list_body.appendChild(date);
                    C_list_body.appendChild(remain_time);
                    C_list_body.appendChild(title);
                    cnt++;
                }
            }
            if (cnt > 0) {
                C_list_container.appendChild(C_list_body);
                // C_header.appendChild(C_header_title);

                item_cnt++;
            }
            C_header.appendChild(C_header_title);
        }
        // list end //


        if (item_cnt > 0) {
            // kadaiDiv.appendChild(C_header);
            // kadaiDiv.appendChild(C_list_container);
            C_header.style.display = "";
            C_list_container.style.display = "";
            main_div.appendChild(kadaiDiv);
            main_div.appendChild(examDiv);
        }
        kadaiDiv.appendChild(C_header);
        kadaiDiv.appendChild(C_list_container);

    }
    try {
        parent.insertBefore(main_div, ref);
    } catch (e) {
        console.log("error");
    }
    getFromStorage('kadaiMemo').then(function (kadaiMemo) {
        if(kadaiMemo!==undefined){
            addMemo(kadaiMemo);
        }

    });
}

function insertSideNavExam(parsedExam, examListAll, lectureIDList, lastExamGetTime) {
    let idList = parseID(lectureIDList);

    let examDiv = document.querySelector('.exam-tab');
    examDiv.innerHTML = '';

    let examBox = document.createElement('div');
    examBox.className = "examBox";

    let loadButton = document.createElement('button');
    loadButton.innerText = "テスト・クイズ情報を取得する";
    loadButton.className = "btn-square";
    loadButton.addEventListener("click", loadExamfromPanda, false);

    let dateTime = new Date(lastExamGetTime);
    let lastLoad = document.createElement('p');
    lastLoad.className = "lastLoad";
    lastLoad.innerText = "最終更新：　" + dateTime.toLocaleDateString() + " " + dateTime.getHours() + ":" + ('00' + dateTime.getMinutes()).slice(-2) + ":" + ('00' + dateTime.getSeconds()).slice(-2);
    if (lastExamGetTime === undefined) lastLoad.innerText = "最終更新：未取得";

    let info1 = document.createElement('p');
    info1.innerText = "※PandAに若干の負荷がかかるため、必要時以外取得ボタンを押さないようお願いします。"
    let info2 = document.createElement('p');
    info2.innerText = "※各コースサイトの「テスト・クイズ」に関連付けられてないものについては取得できません。取得されたテスト・クイズ一覧は参考程度にご覧ください。"

    examBox.appendChild(lastLoad);
    examBox.appendChild(loadButton);
    examBox.appendChild(info1);
    examBox.appendChild(info2);

    // generate exam todo list
    for (let i = 0; i < 4; i++) {
        let item_cnt = 0;
        // header begin //
        var C_header = header.cloneNode(true);
        var C_header_title = header_title.cloneNode(true);
        C_header.className = `sidenav-${header_color[i]}`;
        C_header_title.textContent = `${header_list[i]}`;
        // header end //

        // list begin //
        var C_list_container = list_container.cloneNode(true);

        let parsedExam_length = 0;
        if (parsedExam !== undefined) parsedExam_length = parsedExam.length;

        for (let item = 0; item < parsedExam_length; item++) {
            let examList = parsedExam[item].examList;
            let lectureID = parsedExam[item].lectureID;

            var C_list_body = list_body.cloneNode(true);
            C_list_body.className = `kadai-${header_color[i]}`;

            let lectureName = idList[lectureID];
            if (lectureName === undefined) lectureName = "不明";

            var C_h2 = h2.cloneNode(true);
            C_h2.className = `lecture-${header_color[i]}`;
            C_h2.textContent = "" + lectureName;
            C_list_body.appendChild(C_h2);

            let cnt = 0;

            for (let id = 0; id < examList.length; id++) {
                let chkbox = p_chkbox.cloneNode(true);
                let label = p_label.cloneNode(true);
                let date = p_date.cloneNode(true);
                let remain_time = remain.cloneNode(true);
                let title = p_title.cloneNode(true);

                let dueTime = examList[id].dueDate;
                let _date = new Date(dueTime);
                let eid = examList[id].eid;
                let kadaiTitle = examList[id].title;
                let dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ('00' + _date.getMinutes()).slice(-2);
                let timeRemain = getTimeRemain((dueTime - new Date().getTime()) / 1000);

                let daysUntilDue = diffDays(new Date().getTime(), dueTime);
                if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue > 5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && i === 3)) {
                    date.textContent = "" + dispDue;
                    remain_time.textContent = `あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;
                    title.textContent = "" + kadaiTitle;
                    const q = examListAll.findIndex((exam) => {
                        return (exam.eid === eid);
                    });
                    if (q !== -1) {
                        if (examListAll[q].isFinished === 1) chkbox.checked = true;
                    }
                    chkbox.id = eid;
                    chkbox.lectureID = lectureID;
                    chkbox.addEventListener('change', updateExamTodo, false);
                    label.htmlFor = eid;
                    C_list_body.appendChild(chkbox);
                    C_list_body.appendChild(label);
                    C_list_body.appendChild(date);
                    C_list_body.appendChild(remain_time);
                    C_list_body.appendChild(title);
                    // console.log(C_list_body);
                    cnt++;
                }
            }
            if (cnt > 0) {
                C_list_container.appendChild(C_list_body);
                C_header.appendChild(C_header_title);
                item_cnt++;
            }
        }
        // list end //

        examDiv.appendChild(examBox);

        if (item_cnt > 0) {
            examDiv.appendChild(C_header);
            examDiv.appendChild(C_list_container);
        }

    }
}


function updateKadaiTodo(event) {
    // console.log(event.target.kid);
    getFromStorage('kadaiTodo').then(function (kadaiTodo) {
        if (typeof kadaiTodo !== 'undefined') {
            const q = kadaiTodo.findIndex((kadai) => {
                return (kadai.kid === event.target.id);
            });
            if (q !== -1) {
                kadaiTodo[q].isFinished = 1 - kadaiTodo[q].isFinished;
            }
        }
        saveKadaiTodo(kadaiTodo);
        // console.log("update kadaitodo", event.target.id);

    });
}

function updateExamTodo(event) {
    // console.log(event.target.kid);
    getFromStorage('examTodo').then(function (examTodo) {
        if (typeof examTodo !== 'undefined') {
            const q = examTodo.findIndex((exam) => {
                return (exam.eid === parseInt(event.target.id));
            });
            // console.log("find",q,event.target.id);
            if (q !== -1) {
                examTodo[q].isFinished = 1 - examTodo[q].isFinished;
            }
        }
        saveExamTodo(examTodo);
        // console.log("update examtodo", event.target.id);

    });
}

const defaultTab = document.querySelectorAll('.nav-menu');
const defaultTabCount = Object.keys(defaultTab).length;
const otherSiteTab = document.querySelectorAll('#otherSiteList > li');
const otherSiteTabCount = Object.keys(otherSiteTab).length;


function diffDays(dt1, dt2) {

    let diff = (dt2 - dt1) / 1000;
    diff /= 3600 * 24;
    if (diff < 0) diff = 9999;
    return (diff);

}


function addNotificationBadge(lectureIDList, upToDateKadaiList) {
    const lectureIDCount = lectureIDList.length;

    //タブにある全科目を回す。
    for (let i = 0; i < lectureIDCount; i++) {
        // default Tab
        if (lectureIDList[i].type === 'default') {
            for (let j = 2; j < defaultTabCount; j++) {
                let lectureID = defaultTab[j].getElementsByTagName('span')[1].getAttribute('data');
                const q = upToDateKadaiList.findIndex((kadai) => {
                    return (kadai.lectureID === lectureID);
                });
                if (q !== -1) {
                    if (upToDateKadaiList[q].isUpdate === 1) {
                        defaultTab[j].classList.add('badge');
                    }
                    let daysUntilDue = diffDays(new Date().getTime(), upToDateKadaiList[q].closestTime);
                    if (daysUntilDue <= 1) {
                        defaultTab[j].classList.add('nav-danger');
                    } else if (daysUntilDue <= 5) {
                        defaultTab[j].classList.add('nav-warning');
                    } else if (daysUntilDue <= 14) {
                        defaultTab[j].classList.add('nav-safe');
                    }
                }
            }
        }
        // otherSite Tab
        else if (lectureIDList[i].type === 'otherSite') {
            for (let j = 0; j < otherSiteTabCount; j++) {
                let lectureID = otherSiteTab[j].getElementsByTagName('a')[0].getAttribute('href').slice(-17);
                const q = upToDateKadaiList.findIndex((kadai) => {
                    return (kadai.lectureID === lectureID);
                });
                if (q !== -1) {
                    if (upToDateKadaiList[q].isUpdate === 1) {
                        otherSiteTab[j].classList.add('badge');
                    }
                    let daysUntilDue = diffDays(new Date().getTime(), upToDateKadaiList[q].closestTime);
                    if (daysUntilDue <= 1) {
                        otherSiteTab[j].classList.add('nav-danger');
                    } else if (daysUntilDue <= 5) {
                        otherSiteTab[j].classList.add('nav-warning');
                    } else if (daysUntilDue <= 14) {
                        otherSiteTab[j].classList.add('nav-safe');
                    }
                }
            }
        }
    }


}

function getTabList() {
    let lectureIDList = [];

    for (let i = 2; i < defaultTabCount; i++) {
        let tmpTab = {};

        let lectureID = defaultTab[i].getElementsByTagName('a')[0].getAttribute('href').slice(-17);
        let lectureID2 = defaultTab[i].getElementsByTagName('span')[1].getAttribute('data');
        let lectureName = defaultTab[i].getElementsByTagName('a')[0].getAttribute('title').split("]")[1];

        tmpTab.type = 'default';
        tmpTab.lectureID = lectureID2;
        tmpTab.lectureName = lectureName;

        lectureIDList.push(tmpTab);

    }
    for (let i = 0; i < otherSiteTabCount; i++) {
        let tmpTab = {};
        let lectureID = otherSiteTab[i].getElementsByTagName('a')[0].getAttribute('href').slice(-17);
        let lectureName = otherSiteTab[i].getElementsByTagName('a')[0].getAttribute('title').split("]")[1];

        tmpTab.type = 'otherSite';
        tmpTab.lectureID = lectureID;
        tmpTab.lectureName = lectureName;

        lectureIDList.push(tmpTab);

    }

    return lectureIDList;

}

function parseKadai(data, types) {
    let parsedKadai = [];
    let item = data.assignment_collection;
    for (let i = 0; i < item.length; i++) {
        let temp = {};
        let lecID = item[i].context;
        let kid = item[i].id;
        let title = item[i].title;
        let due = item[i].dueTime.time;
        let isFinished = 0;
        // add only available kadai
        if (due <= new Date().getTime()) {
            continue;
        }
        let kadaiDict = {kid: kid, dueTimeStamp: due, kadaiTitle: title};
        if (types === 'mini') {
            kadaiDict = {kid: kid, dueTimeStamp: due, kadaiTitle: title, isFinished: isFinished};
        }

        // すでに科目がListにあるか見る
        const q = parsedKadai.findIndex((kadai) => {
            return (kadai.lectureID === lecID);
        });
        //無ければ新規作成
        if (q === -1) {
            temp.lectureID = lecID;
            temp.kadaiList = [kadaiDict];
            if (types !== "mini") {
                temp.closestTime = due;
                temp.farthestTime = due;
            }
            parsedKadai.push(temp);
        } else {
            temp = parsedKadai[q];
            //一番期限がやばい課題のタイムスタンプを記録
            if (types !== "mini") {
                if (temp.closestTime > due) temp.closestTime = due;
                if (temp.farthestTime < due) temp.farthestTime = due;
            }
            temp.kadaiList.push(kadaiDict);
            parsedKadai[q] = temp;
        }


    }
    return parsedKadai;
}

function extractKadai(parsedKadai) {
    let kadaiListAll = []
    for (let i = 0; i < parsedKadai.length; i++) {
        let kadaiList = parsedKadai[i].kadaiList;
        for (let kadai = 0; kadai < kadaiList.length; kadai++) {
            let tmp = {};
            tmp.kid = kadaiList[kadai].kid;
            tmp.isFinished = 0;
            kadaiListAll.push(tmp);
        }
    }
    return kadaiListAll
}

function getKadaiTodo(parsedKadai) {
    let kadaiListAll = extractKadai(parsedKadai);
    getFromStorage('kadaiTodo').then(function (kadaiTodo) {
        if (typeof kadaiTodo !== 'undefined') {
            for (let i = 0; i < kadaiListAll.length; i++) {
                let kid = kadaiListAll[i].kid;
                const q = kadaiTodo.findIndex((kadai) => {
                    return (kadai.kid === kid);
                });
                if (q !== -1) {
                    if (kadaiTodo[q].isFinished === 1) kadaiListAll[i].isFinished = 1;
                }
            }
        }
        saveKadaiTodo(kadaiListAll);
        // console.log("kadaiListAll", kadaiListAll);
        console.log("parsed kadai", parsedKadai);
        // test
        insertSideNav(parsedKadai, kadaiListAll, getTabList());
        insertJS();
    });
}

function getExamTodo(examListAll, parsedExam) {
    getFromStorage('examTodo').then(function (examTodo) {
        if (typeof examTodo !== 'undefined' && examTodo.length > 0) {
            for (let i = 0; i < examListAll.length; i++) {
                let eid = examListAll[i].eid;
                const q = examTodo.findIndex((exam) => {
                    return (exam.eid === eid);
                });
                if (q !== -1) {
                    // console.log(eid,examTodo[q]);
                    if (examTodo[q].isFinished === 1) examListAll[i].isFinished = 1;
                }
            }
        }
        // console.log("all",examListAll);
        // console.log("pe",parsedExam);
        saveExamTodo(examListAll, parsedExam);
        insertSideNavExam(parsedExam, examListAll, getTabList(), new Date().getTime());
    });
}


function getKadaiFromPandA() {
    return $.ajax({
        url: "https://panda.ecs.kyoto-u.ac.jp/direct/assignment/my.json",
        dataType: "json",
        type: "get",
        cache: false,
    });
}


function getFromStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (items) {
            resolve(items[key]);
        });
    });
}

function updateVisited(lectureID) {
    getFromStorage('hasNewItem').then(function (hasNewItem) {
        // console.log('fetch hasNewitem', hasNewItem);
        if (hasNewItem === undefined) return 0;
        const q = hasNewItem.findIndex((kadai) => {
            return (kadai.lectureID === lectureID);
        });
        if (q !== -1) {
            hasNewItem[q].isUpdate = 0;
            saveHasNew(hasNewItem);
        }

    });
}

function saveKadai(parsedKadai) {
    var date = new Date();
    let entity = {};

    entity.kadai = parsedKadai;
    entity.lastModified = date.getTime();
    chrome.storage.local.set(entity, function () {
        // console.log('stored kadai');
    });
}

function saveHasNew(noticationList) {
    var date = new Date();
    let entity = {};

    entity.hasNewItem = noticationList;
    entity.lastModified = date.getTime();
    chrome.storage.local.set(entity, function () {
        // console.log('stored hasNew');
    });
}

function saveKadaiTodo(kadaiListAll) {
    let entity = {};

    entity.kadaiTodo = kadaiListAll;
    chrome.storage.local.set(entity, function () {
        // console.log('stored hasNew');
    });
}

function saveExamTodo(examListAll, parsedExam) {
    let entity = {};

    entity.examTodo = examListAll;
    chrome.storage.local.set(entity, function () {
    });
    if (parsedExam !== undefined) {
        entity = {};
        entity.parsedExam = parsedExam;
        chrome.storage.local.set(entity, function () {
        });
    }
    entity = {};
    entity.lastExamGetTime = new Date().getTime();
    chrome.storage.local.set(entity, function () {
    });
}


function createNotificationList(upToDateKadaiList, hasNewItem) {
    let notificationList = [];

    for (let i = 0; i < upToDateKadaiList.length; i++) {
        let tmp = upToDateKadaiList[i];
        let lectureID = upToDateKadaiList[i].lectureID;
        if (typeof hasNewItem !== 'undefined') {

            const q = hasNewItem.findIndex((item) => {
                return (item.lectureID === lectureID);
            });

            if (q === -1) {
                // 差分あり
                if (upToDateKadaiList[i].isUpdate === 1) {
                    tmp.isUpdate = 1;
                }
                // 差分なし
                else {
                    tmp.isUpdate = 0;
                }
            } else {
                let hasNew = hasNewItem[q].isUpdate;
                // 差分あり
                if (upToDateKadaiList[i].isUpdate === 1) {
                    tmp.isUpdate = 1;
                }
                // 差分なし
                else {
                    //もし過去にupdateを確認してなかったら（hasNew=1だったら）引き続き1が入る。
                    //TODO: farthestTime が nowTimeより古ければisUpdate=0
                    tmp.isUpdate = hasNew;
                }

            }
        } else {
            // 差分あり
            if (upToDateKadaiList[i].isUpdate === 1) {
                tmp.isUpdate = 1;
            }
            // 差分なし
            else {
                tmp.isUpdate = 0;
            }
        }
        notificationList.push(tmp);
    }

    return notificationList;

}

function compare(parsedKadai, storedKadai) {
    let upToDateKadaiList = [];

    // 最新の課題を基準に1つずつ見ていく
    for (let i = 0; i < parsedKadai.length; i++) {
        let tmp = {};
        let lectureID = parsedKadai[i].lectureID;
        let closestTime = parsedKadai[i].closestTime;
        let farthestTime = parsedKadai[i].farthestTime;
        let kadaiList = parsedKadai[i].kadaiList;
        // find lectureID from stored data.
        const q = storedKadai.findIndex((store) => {
            return (store.lectureID === lectureID);
        });
        // 過去に保存されていない科目は無条件でisUpdated フラグ
        if (q === -1) {
            tmp.lectureID = lectureID;
            tmp.isUpdate = 1;
            tmp.closestTime = closestTime;
            tmp.farthestTime = farthestTime;
        } else {
            tmp.lectureID = lectureID;
            tmp.isUpdate = 0;
            tmp.closestTime = closestTime;
            tmp.farthestTime = farthestTime;
            // 任意の最新課題について過去に保存されているか見る
            for (let j = 0; j < kadaiList.length; j++) {
                let kid = kadaiList[j].kid;
                const q2 = storedKadai[q].kadaiList.findIndex((storelist) => {
                    return (storelist.kid === kid);
                });
                // もし保存されていなかったらそれは新規課題なのでflagを立てる
                if (q2 === -1) tmp.isUpdate = 1;
            }
        }
        upToDateKadaiList.push(tmp);
    }
    return upToDateKadaiList;
}

function isPandAOK() {
    //TODO: 動かす　今は全部true
    let pandaStatus = true;
    getFromStorage('lastModified').then(function (lastModified) {

        if (typeof lastModified !== 'undefined' && (new Date().getTime() - lastModified) / 1000 <= 30) {
            pandaStatus = false;
        }
        // console.log('last', lastModified, (new Date().getTime() - lastModified) / 1000, pandaStatus);
    });
    return pandaStatus;
}

function getSiteID() {
    var url = location.href;
    let lectureID = '';
    var reg = new RegExp("https://panda.ecs.kyoto-u.ac.jp/portal.*?/(.*?)(?=/)");
    if (url.match(reg) && url.match(reg)[1] === 'site') {
        lectureID = url.slice(44, 61);
    }
    return lectureID;
}

function update() {
    if (getSiteID() && getSiteID().length === 17) {
        // console.log('visited', getSiteID());
        updateVisited(getSiteID());
    }
}

function display() {
    // 1. Get latest kadai
    getKadaiFromPandA().done(function (result) {
        let parsedKadai = parseKadai(result);
        if (parsedKadai.length === 0) return;
        // // test
        // insertSideNav(parseKadai(result,'mini'), getTabList());
        // insertJS();
        getKadaiTodo(parsedKadai);
        // 2. Get old kadai from storage
        getFromStorage('kadai').then(function (storedKadai) {
            // 3. If there is no kadai in storege -> initialize
            if (typeof storedKadai === 'undefined') {
                saveKadai(parsedKadai);
            } else {
                // 3. else compare latest and saved kadai list ->make uptodate list
                let upToDateKadaiList;
                upToDateKadaiList = compare(parsedKadai, storedKadai);

                // 4. Get visited history
                getFromStorage('hasNewItem').then(function (hasNewItem) {

                    if (typeof hasNewItem === 'undefined') {
                        hasNewItem = [];
                    }
                    // console.log('fetch stored hasNewItem', hasNewItem);

                    let notificationList = createNotificationList(upToDateKadaiList, hasNewItem);
                    // console.log('notificationList', notificationList);

                    saveHasNew(notificationList);
                    saveKadai(parsedKadai);

                    addNotificationBadge(getTabList(), notificationList);

                });
            }
        });
    });
}

function main() {
    if (isPandAOK()) {
        // console.log("you can hurry panda!");
        display();
    } else {
        // console.log("dont hurry panda!");
        getFromStorage('hasNewItem').then(function (hasNewItem) {
            addNotificationBadge(getTabList(), hasNewItem);
        });
    }
    update();
}

function loadExamfromStorage() {
    getFromStorage('parsedExam').then(function (parsedExam) {
        getFromStorage('examTodo').then(function (examToDo) {
            getFromStorage('lastExamGetTime').then(function (lastExamGetTime) {
                insertSideNavExam(parsedExam, examToDo, getTabList(), lastExamGetTime);
            });
        });
    });
}

function loadExamfromPanda() {
    let lectureIDList = getTabList();
    let lecID = [];
    for (let i = 0; i < lectureIDList.length; i++) {
        lecID.push(lectureIDList[i].lectureID);
    }

    let promiseResult = [];
    // lecID=["2020-888-N228-003","2020-888-N228-002"];
    let examListAll = [];
    let parsedExam = [];

    // console.log(lecID);

    async function get(url) {
        return fetch(`https://panda.ecs.kyoto-u.ac.jp/direct/sam_pub/context/${url}.json`).then((response) => {
            return response.json()
        });
    }

    for (let id of lecID) {
        promiseResult.push(get(id));
    }

    Promise.all(promiseResult)
        .then((exam) => {
            const lectureCount = exam.length;


            for (let i = 0; i < lectureCount; i++) {
                const examInfo = exam[i].sam_pub_collection;
                let examCount = examInfo.length;
                let examTemp = {};
                let examList = [];

                for (let j = 0; j < examCount; j++) {
                    let tmp = {};
                    examTemp.lectureID = examInfo[j].ownerSiteId;
                    tmp.eid = examInfo[j].publishedAssessmentId;
                    tmp.lectureID = examInfo[j].ownerSiteId;
                    tmp.dueDate = examInfo[j].dueDate;
                    tmp.title = examInfo[j].title;
                    tmp.isFinished = 0;
                    examListAll.push(tmp);
                    examList.push(tmp);
                }
                if (examCount !== 0) {
                    examTemp.examList = examList;
                    parsedExam.push(examTemp);
                }

            }
            getExamTodo(examListAll, parsedExam);

        })
        .catch((value) => {
            console.log("error fetching quiz from panda", value);
        });
}


insertCSS();
main();



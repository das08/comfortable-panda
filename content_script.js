//----------- Begin miniPandA declaration --------------//
const defaultTab = document.querySelectorAll('.nav-menu');
const defaultTabCount = Object.keys(defaultTab).length;
const otherSiteTab = document.querySelectorAll('#otherSiteList > li');
const otherSiteTabCount = Object.keys(otherSiteTab).length;
const header_name = ["締め切り２４時間以内", "締め切り５日以内", "締め切り１４日以内", "その他"];
const header_color = ["danger", "warning", "success", "other"];
const initLetter = ["a", "b", "c", "d"];

const nowTime = new Date().getTime();
// const nowTime = 1590937200000;

const tabList = getTabList();

let hamburger = createElem("div", {className: "loader"});

let header = createElem("div");
let header_title = createElem("span", {className: "q"});
let list_container = createElem("div", {className: "sidenav-list"});
let list_body = createElem("div");
let h2 = createElem("h2");
let p_chkbox = createElem("input", {type: "checkbox", className: "todo-check"});
let p_label = createElem("label");
let p_date = createElem("p", {className: "kadai-date"});
let remain = createElem("span", {className: "time-remain"});
let p_title = createElem("p", {className: "kadai-title"});

let main_div = createElem("div", {id: "mySidenav"});
let kadaiDiv = createElem("div", {className: "kadai-tab"});
let examDiv = createElem("div", {className: "exam-tab"});
let parent = document.getElementById('container');
let ref = document.getElementById('toolMenuWrap');

//----------- End miniPandA declaration --------------//

function createElem(tag, dict) {
    let elem = document.createElement(tag);
    for (let key in dict) {
        elem[key] = dict[key];
    }
    return elem
}

function appendChildAll(to, array) {
    for (let obj in array) {
        to.appendChild(array[obj]);
    }
    return to
}

function insertCSS() {
    let css = createElem("link", {rel: "stylesheet", type: "text/css"});
    css.href = chrome.extension.getURL('css/custom-panda.css');
    document.body.appendChild(css);
}

function parseID(lectureIDList) {
    let idList = {};
    for (let i = 0; i < lectureIDList.length; i++) {
        let id = lectureIDList[i].lectureID;
        idList[id] = lectureIDList[i].lectureName;
    }
    return idList;
}

function sortKadai(parsedKadai) {
    for (let i = 0; i < parsedKadai.length; i++) {
        let kadaiList = parsedKadai[i].kadaiList;
        kadaiList.sort(function (a, b) {
            if (a.dueTimeStamp < b.dueTimeStamp) return -1;
            if (a.dueTimeStamp > b.dueTimeStamp) return 1;
            if (a.kadaiTitle < b.kadaiTitle) return -1;
            if (a.kadaiTitle > b.kadaiTitle) return 1;
            return 0;
        });
        parsedKadai[i].kadaiList = kadaiList;
    }
    return parsedKadai;
}

function genUniqueStr() {
    return "m" + new Date().getTime().toString(16) + Math.floor(123456 * Math.random()).toString(16);
}

function getDaysUntil(dt1, dt2) {
    let diff = (dt2 - dt1) / 1000;
    diff /= 3600 * 24;
    if (diff < 0) diff = 9999;
    return (diff);
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
    let addMemoButton = document.querySelector('.plus-button');
    addMemoButton.style.display = '';
}

function toggleExamTab() {
    let kadaiTab = document.querySelector('.kadai-tab');
    kadaiTab.style.display = 'none';
    let examTab = document.querySelector('.exam-tab');
    examTab.style.display = '';
    let addMemoButton = document.querySelector('.plus-button');
    addMemoButton.style.display = 'none';
    console.log("examtab pressed");
    loadExamfromStorage();
}

function toggleMemoBox() {
    let addMemoBox = document.querySelector('.addMemoBox');
    let toggleStatus = addMemoBox.style.display;
    if (toggleStatus === '') addMemoBox.style.display = 'none';
    else addMemoBox.style.display = '';
}

function addMemo(kadaiMemo, kadaiMemoListAll) {
    let idList = parseID(tabList);
    //Delete old
    let oldMemo = document.querySelectorAll('.todoMemo');
    oldMemo.forEach((item) => {
        item.remove()
    });

    for (let i = 0; i < 4; i++) {
        for (let row = 0; row < kadaiMemo.length; row++) {
            let kadaiMemoList = kadaiMemo[row].kadaiList;
            let lectureID = kadaiMemo[row].lectureID;
            for (let memo = 0; memo < kadaiMemoList.length; memo++) {

                let dueTime = kadaiMemoList[memo].dueTimeStamp;
                let kid = kadaiMemoList[memo].kid;
                let kadaiTitle = kadaiMemoList[memo].kadaiTitle;

                let daysUntilDue = getDaysUntil(nowTime, dueTime);
                if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue > 5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && daysUntilDue <= 1000 && i === 3)) {
                    let kadaiTodoDiv = document.querySelector(`#${initLetter[i]}${lectureID}`);

                    let chkbox = p_chkbox.cloneNode(true);
                    let label = p_label.cloneNode(true);
                    let date = p_date.cloneNode(true);
                    let remain_time = remain.cloneNode(true);
                    let title = p_title.cloneNode(true);

                    let _date = new Date(dueTime);
                    let dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ('00' + _date.getMinutes()).slice(-2);
                    let timeRemain = getTimeRemain((dueTime - nowTime) / 1000);

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
                        parent.style.display = "";
                        let header = document.querySelector(`.sidenav-${header_color[i]}`);
                        header.style.display = "";
                        kadaiTodoDiv = document.querySelector(`#${initLetter[i]}${lectureID}`);//todo 不安

                    }

                    date.textContent = "" + dispDue;
                    remain_time.textContent = `あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;

                    let memoBadge = document.createElement('span');
                    memoBadge.classList.add("add-badge");
                    memoBadge.classList.add("add-badge-success");
                    memoBadge.innerText = "メモ";
                    let deleteBadge = document.createElement('span');
                    deleteBadge.className = "del-button";
                    deleteBadge.id = kid;
                    deleteBadge.addEventListener('click', deleteKadaiMemo, true);
                    deleteBadge.innerText = "×";

                    title.appendChild(memoBadge);
                    title.append(kadaiTitle);
                    title.appendChild(deleteBadge);

                    const q = kadaiMemoListAll.findIndex((kadai) => {
                        return (kadai.kid === kid);
                    });
                    if (q !== -1) {
                        if (kadaiMemoListAll[q].isFinished === 1) chkbox.checked = true;
                    }
                    chkbox.id = kid;
                    chkbox.lectureID = lectureID;
                    chkbox.addEventListener('change', updateKadaiMemoTodo, false);
                    label.htmlFor = kid;

                    //add memo tag
                    chkbox.classList.add("todoMemo");
                    label.classList.add("todoMemo");
                    date.classList.add("todoMemo");
                    remain_time.classList.add("todoMemo");
                    title.classList.add("todoMemo");
                    appendChildAll(kadaiTodoDiv, [chkbox, label, date, remain_time, title]);
                    //hide relaxpanda
                    let relaxPanda = document.querySelector(".relaxpanda");
                    if (relaxPanda) relaxPanda.innerHTML = "";
                }
            }
        }
    }
}

function parseKadaiMemo(kadaiMemo, _kadaiMemoListAll) {
    if (_kadaiMemoListAll === undefined) _kadaiMemoListAll = [];
    let kadaiMemoListAll = [];
    for (let item = 0; item < kadaiMemo.length; item++) {
        let kadaiMemoList = kadaiMemo[item].kadaiList;
        let lectureID = kadaiMemo[item].lectureID;
        for (let kadai = 0; kadai < kadaiMemoList.length; kadai++) {
            let kadaiMemoID = kadaiMemoList[kadai].kid;
            let kadaiMemoTitle = kadaiMemoList[kadai].kadaiTitle;
            let kadaiMemoDue = kadaiMemoList[kadai].dueTimeStamp;
            let isFinished = 0;
            const q = _kadaiMemoListAll.findIndex((item) => {
                return (item.kid === kadaiMemoID);
            });
            if (q !== -1) {
                isFinished = _kadaiMemoListAll[q].isFinished;
            }
            kadaiMemoListAll.push({
                kid: kadaiMemoID,
                dueDate: kadaiMemoDue,
                isFinished: isFinished,
                lectureID: lectureID,
                title: kadaiMemoTitle
            });
        }
    }
    return kadaiMemoListAll;
}

function todoAdd(event) {
    let selectedIdx = document.querySelector(".todoLecName").selectedIndex;
    let todoLecID = document.querySelector(".todoLecName").options[selectedIdx].id;
    let todoContent = document.querySelector(".todoContent").value;
    let todoDue = document.querySelector(".todoDue").value;
    let todoTimestamp = new Date(`${todoDue}`).getTime();

    getFromStorage('kadaiMemo').then(function (_kadaiMemo) {
        let kadaiMemo;
        if (typeof _kadaiMemo !== 'undefined' && _kadaiMemo.length > 0) {
            const q = _kadaiMemo.findIndex((item) => {
                return (item.lectureID === todoLecID);
            });
            if (q !== -1) {
                _kadaiMemo[q].kadaiList.push({
                    kid: genUniqueStr(),
                    dueTimeStamp: todoTimestamp,
                    kadaiTitle: todoContent
                });
            } else {
                let kadaiList = [{kid: genUniqueStr(), dueTimeStamp: todoTimestamp, kadaiTitle: todoContent}];
                let kadai = {lectureID: todoLecID, kadaiList: kadaiList};
                _kadaiMemo.push(kadai);
            }
            kadaiMemo = _kadaiMemo;
        } else {
            let kadaiList = [{kid: genUniqueStr(), dueTimeStamp: todoTimestamp, kadaiTitle: todoContent}];
            kadaiMemo = [{lectureID: todoLecID, kadaiList: kadaiList}];

        }
        getFromStorage('kadaiMemoTodo').then(function (kadaiMemoTodo) {
            let kadaiMemoListAll = parseKadaiMemo(kadaiMemo, kadaiMemoTodo);

            addMemo(kadaiMemo, kadaiMemoListAll);

            // Save
            let entity = {};
            entity.kadaiMemo = kadaiMemo;
            chrome.storage.local.set(entity, function () {
            });
            entity = {};
            entity.kadaiMemoTodo = kadaiMemoListAll;
            chrome.storage.local.set(entity, function () {
            });
        });
    });
}

function createSideNav() {
    let lectureIDList = tabList;
    // add hamburger
    let topbar = document.getElementById("mastHead");
    hamburger.addEventListener('click', toggleSideNav);
    try {
        topbar.appendChild(hamburger);
    } catch (e) {
        console.log("could not launch miniPandA.")
    }

    main_div.classList.add("sidenav");
    main_div.classList.add("cp_tab");

    const img = chrome.extension.getURL("img/logo.png");
    let logo = createElem("img", {className: "logo", alt: "logo", src: img});

    let a = createElem("a", {href: "#", id: "close_btn", textContent: "×"});
    a.classList.add("closebtn");
    a.classList.add("q");
    a.addEventListener('click', toggleSideNav);

    let kadaiTab = createElem("input", {type: "radio", id: "kadaiTab", name: "cp_tab", checked: true});
    kadaiTab.addEventListener('click', toggleKadaiTab);
    let kadaiTabLabel = createElem("label", {htmlFor: "kadaiTab", innerText: "課題一覧"});
    let examTab = createElem("input", {type: "radio", id: "examTab", name: "cp_tab", checked: false});
    examTab.addEventListener('click', toggleExamTab);
    let examTabLabel = createElem("label", {htmlFor: "examTab", innerText: "テスト・クイズ一覧"});
    let addMemoButton = createElem("button", {className: "plus-button", innerText: "+"});
    addMemoButton.addEventListener('click', toggleMemoBox, true);

    appendChildAll(main_div, [logo, a, kadaiTab, kadaiTabLabel, examTab, examTabLabel, addMemoButton]);

    // add edit box
    let memoEditBox = createElem("div");
    memoEditBox.classList.add("examBox");
    memoEditBox.classList.add("addMemoBox");
    memoEditBox.style.display = "none";
    let todo_label = createElem("label");
    todo_label.style.display = "block";

    let todoLecLabel = todo_label.cloneNode(true);
    todoLecLabel.innerText = "講義名";
    let todoLecSelect = createElem("select", {className: "todoLecName"});
    let todoLecOption = createElem("option");

    for (let i = 0; i < lectureIDList.length; i++) {
        if (lectureIDList[i].lectureName === undefined) continue;
        let c_todoLecOption = todoLecOption.cloneNode(true);
        c_todoLecOption.text = lectureIDList[i].lectureName;
        c_todoLecOption.id = lectureIDList[i].lectureID;
        todoLecSelect.appendChild(c_todoLecOption);
    }
    todoLecLabel.appendChild(todoLecSelect);

    let todoContentLabel = todo_label.cloneNode(true);
    todoContentLabel.innerText = "メモ";
    let todoContentInput = createElem("input", {type: "text", className: "todoContent"});
    todoContentLabel.appendChild(todoContentInput);

    let todoDueLabel = todo_label.cloneNode(true);
    todoDueLabel.innerText = "期限";
    let todoDueInput = createElem("input", {type: "datetime-local", className: "todoDue"});
    todoDueInput.value = new Date(`${new Date().toISOString().substr(0, 16)}-10:00`).toISOString().substr(0, 16);
    todoDueLabel.appendChild(todoDueInput);

    let todoSubmitButton = createElem("button", {type: "submit", id: "todo-add", innerText: "追加"});
    todoSubmitButton.addEventListener('click', todoAdd, true);

    appendChildAll(memoEditBox, [todoLecLabel, todoContentLabel, todoDueLabel, todoSubmitButton]);
    kadaiDiv.appendChild(memoEditBox);
    // add edit box

    try {
        parent.insertBefore(main_div, ref);
    } catch (e) {
        console.log("Could not create sidenav.");
    }
}

function insertSideNav(parsedKadai, kadaiListAll, lectureIDList) {
    let idList = parseID(lectureIDList);
    parsedKadai = sortKadai(parsedKadai);

    // generate kadai todo list
    for (let i = 0; i < 4; i++) {
        let item_cnt = 0;

        var C_header = header.cloneNode(true);
        var C_header_title = header_title.cloneNode(true);
        C_header.className = `sidenav-${header_color[i]}`;
        C_header.style.display = "none";
        C_header_title.textContent = `${header_name[i]}`;
        C_header.appendChild(C_header_title);

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
                let timeRemain = getTimeRemain((dueTime - nowTime) / 1000);

                let daysUntilDue = getDaysUntil(nowTime, dueTime);
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
                    appendChildAll(C_list_body, [chkbox, label, date, remain_time, title]);
                    cnt++;
                }
            }
            if (cnt > 0) {
                C_list_container.appendChild(C_list_body);
                item_cnt++;
            }
        }
        // list end //

        if (item_cnt > 0) {
            C_header.style.display = "";
            C_list_container.style.display = "";
        }
        appendChildAll(main_div, [kadaiDiv, examDiv]);
        appendChildAll(kadaiDiv, [C_header, C_list_container]);
    }

    if (parsedKadai.length === 0) {
        let kadaiTab = kadaiDiv;
        const img_relaxPanda = chrome.extension.getURL("img/relaxPanda.png");
        let relaxDiv = createElem("div", {className: "relaxpanda"});
        let relaxPandaP = createElem("p", {className: "relaxpanda-p", innerText: "現在提出できる課題はありません"});
        let relaxPandaImg = createElem("img", {className: "relaxpanda-img", alt: "logo", src: img_relaxPanda});
        appendChildAll(relaxDiv, [relaxPandaP, relaxPandaImg]);
        kadaiTab.appendChild(relaxDiv);
    }
    getFromStorage('kadaiMemo').then(function (kadaiMemo) {
        getFromStorage('kadaiMemoTodo').then(function (kadaiMemoTodo) {
            if (kadaiMemo !== undefined) {
                if (kadaiMemoTodo === undefined) kadaiMemoTodo = [];
                addMemo(kadaiMemo, kadaiMemoTodo);
            }
        });
    });
}

function insertSideNavExam(parsedExam, examListAll, lectureIDList, lastExamGetTime) {
    let idList = parseID(lectureIDList);

    let examDiv = document.querySelector('.exam-tab');
    examDiv.innerHTML = '';

    let examBox = createElem("div", {className: "examBox"});

    let loadButton = createElem("button", {innerText: "テスト・クイズ情報を取得する", className: "btn-square"});
    loadButton.addEventListener("click", loadExamfromPanda, false);

    let dateTime = new Date(lastExamGetTime);
    let lastLoad = createElem("p", {className: "lastLoad"});
    lastLoad.innerText = "最終更新：　" + dateTime.toLocaleDateString() + " " + dateTime.getHours() + ":" + ('00' + dateTime.getMinutes()).slice(-2) + ":" + ('00' + dateTime.getSeconds()).slice(-2);
    if (lastExamGetTime === undefined) lastLoad.innerText = "最終更新：未取得";

    let info1 = createElem("p", {innerText: "※PandAに若干の負荷がかかるため、必要時以外取得ボタンを押さないようお願いします。"});
    let info2 = createElem("p", {innerText: "※各コースサイトの「テスト・クイズ」に関連付けられてないものについては取得できません。取得されたテスト・クイズ一覧は参考程度にご覧ください。"});

    appendChildAll(examBox, [lastLoad, loadButton, info1, info2]);

    // generate exam todo list
    for (let i = 0; i < 4; i++) {
        let item_cnt = 0;

        var C_header = header.cloneNode(true);
        var C_header_title = header_title.cloneNode(true);
        C_header.className = `sidenav-${header_color[i]}`;
        C_header_title.textContent = `${header_name[i]}`;

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
                let timeRemain = getTimeRemain((dueTime - nowTime) / 1000);

                let daysUntilDue = getDaysUntil(nowTime, dueTime);
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

                    appendChildAll(C_list_body, [chkbox, label, date, remain_time, title]);
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
            appendChildAll(examDiv, [C_header, C_list_container]);
        }
    }
}

let toggle = false;

function toggleSideNav() {
    if (toggle) {
        main_div.style.width = "0";
        document.getElementById("cover").remove();
    } else {
        main_div.style.width = "300px";
        let cover = document.createElement("div");
        cover.id = "cover";
        document.getElementsByTagName("body")[0].appendChild(cover);
        cover.onclick = toggleSideNav;
    }
    toggle = 1 - toggle;
}

function updateKadaiTodo(event) {
    // TODO: 済　にしてもいいかも
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
    });
}

function updateKadaiMemoTodo(event) {
    getFromStorage('kadaiMemoTodo').then(function (kadaiMemoTodo) {
        if (typeof kadaiMemoTodo !== 'undefined') {
            const q = kadaiMemoTodo.findIndex((kadai) => {
                return (kadai.kid === event.target.id);
            });
            if (q !== -1) {
                kadaiMemoTodo[q].isFinished = 1 - kadaiMemoTodo[q].isFinished;
            }
        }
        saveKadaiMemoTodo(kadaiMemoTodo);
    });
}

function updateExamTodo(event) {
    getFromStorage('examTodo').then(function (examTodo) {
        if (typeof examTodo !== 'undefined') {
            const q = examTodo.findIndex((exam) => {
                return (exam.eid === parseInt(event.target.id));
            });
            if (q !== -1) {
                examTodo[q].isFinished = 1 - examTodo[q].isFinished;
            }
        }
        saveExamTodo(examTodo);
    });
}

function deleteKadaiMemo(event) {
    getFromStorage('kadaiMemo').then(function (kadaiMemo) {
        for (let i = 0; i < kadaiMemo.length; i++) {
            let kadaiList = kadaiMemo[i].kadaiList;
            for (let item = 0; item < kadaiList.length; item++) {
                let kid = kadaiList[item].kid;
                if (kid === event.target.id) {
                    let delMemoSpan = document.querySelectorAll(`#${event.target.id}`)[1];
                    delMemoSpan.innerText = "削除済";
                    kadaiList.splice(item, 1);
                    break;
                }
            }
        }
        let entity = {};
        entity.kadaiMemo = kadaiMemo;
        chrome.storage.local.set(entity, function () {
        });
    });
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
                    let daysUntilDue = getDaysUntil(nowTime, upToDateKadaiList[q].closestTime);
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
                    let daysUntilDue = getDaysUntil(nowTime, upToDateKadaiList[q].closestTime);
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
    // console.log(data.assignment_collection);
    for (let i = 0; i < item.length; i++) {
        let temp = {};
        let lecID = item[i].context;
        let kid = item[i].id;
        let title = item[i].title;
        let due = item[i].dueTime.time;
        let isFinished = 0;
        // add only available kadai
        if (due <= nowTime) {
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
    let kadaiListAll = [];
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
        insertSideNav(parsedKadai, kadaiListAll, tabList);
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
                    if (examTodo[q].isFinished === 1) examListAll[i].isFinished = 1;
                }
            }
        }
        saveExamTodo(examListAll, parsedExam);
        insertSideNavExam(parsedExam, examListAll, tabList, nowTime);
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
    let entity = {};

    entity.kadai = parsedKadai;
    entity.lastModified = nowTime;
    chrome.storage.local.set(entity, function () {
    });
}

function saveHasNew(noticationList) {
    let entity = {};

    entity.hasNewItem = noticationList;
    entity.lastModified = nowTime;
    chrome.storage.local.set(entity, function () {
    });
}

function saveKadaiTodo(kadaiListAll) {
    let entity = {};

    entity.kadaiTodo = kadaiListAll;
    chrome.storage.local.set(entity, function () {
    });
}

function saveKadaiMemoTodo(kadaiMemoListAll) {
    let entity = {};

    entity.kadaiMemoTodo = kadaiMemoListAll;
    chrome.storage.local.set(entity, function () {
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

function compareKadai(parsedKadai, storedKadai) {
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
        tmp.lectureID = lectureID;
        tmp.isUpdate = 1;
        tmp.closestTime = closestTime;
        tmp.farthestTime = farthestTime;
        if (q === -1) {
            tmp.isUpdate = 1;
        } else {
            tmp.isUpdate = 0;
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

function getSiteID() {
    let url = location.href;
    let lectureID = '';
    let reg = new RegExp("https://panda.ecs.kyoto-u.ac.jp/portal.*?/(.*?)(?=/)");
    if (url.match(reg) && url.match(reg)[1] === 'site') {
        lectureID = url.slice(44, 61);
    }
    return lectureID;
}

function updateFlags() {
    if (getSiteID() && getSiteID().length === 17) {
        updateVisited(getSiteID());
    }
}

function display() {

    // 1. Get latest kadai
    getKadaiFromPandA().done(function (result) {
        let parsedKadai = parseKadai(result);

        getKadaiTodo(parsedKadai);
        // 2. Get old kadai from storage
        getFromStorage('kadai').then(function (storedKadai) {
            // 3. If there is no kadai in storege -> initialize
            if (typeof storedKadai === 'undefined') {
                saveKadai(parsedKadai);
            } else {
                // 3. else compare latest and saved kadai list ->make uptodate list
                let upToDateKadaiList;
                upToDateKadaiList = compareKadai(parsedKadai, storedKadai);

                // 4. Get visited history
                getFromStorage('hasNewItem').then(function (hasNewItem) {

                    if (typeof hasNewItem === 'undefined') {
                        hasNewItem = [];
                    }
                    let notificationList = createNotificationList(upToDateKadaiList, hasNewItem);

                    saveHasNew(notificationList);
                    saveKadai(parsedKadai);
                    addNotificationBadge(tabList, notificationList);
                });
            }
        });
        miniPandAReady();
    });
}

function loadExamfromStorage() {
    getFromStorage('parsedExam').then(function (parsedExam) {
        getFromStorage('examTodo').then(function (examToDo) {
            getFromStorage('lastExamGetTime').then(function (lastExamGetTime) {
                insertSideNavExam(parsedExam, examToDo, tabList, lastExamGetTime);
            });
        });
    });
}

function loadExamfromPanda() {
    let lectureIDList = tabList;
    let lecID = [];
    for (let i = 0; i < lectureIDList.length; i++) {
        lecID.push(lectureIDList[i].lectureID);
    }

    let promiseResult = [];
    // lecID=["2020-888-N228-003","2020-888-N228-002"];
    let examListAll = [];
    let parsedExam = [];

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

function miniPandAReady() {
    hamburger.className = "";
    hamburger.id = "hamburger";
    hamburger.textContent = "☰";
}

function main() {
    insertCSS();
    createSideNav();
    //display hamburger first
    setTimeout(() => {
        display();
        updateFlags();
    }, 50);
}

main();

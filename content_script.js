function insertCSS() {
    let css = document.createElement('link');
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = chrome.extension.getURL('css/custom-panda.css');
    document.body.appendChild(css);
}

function insertJS() {
    let js = document.createElement('script');
    js.textContent = "" +

        "      let btn = document.getElementById('close_btn');\n" +
        "      btn.onclick = toggleNav;\n" +
        "      let ham = document.getElementById('hamburger');\n" +
        "      ham.onclick = toggleNav;\n" +
        "    \n" +
        "      let toggle = false;\n" +
        "    function toggleNav() {\n" +

        "      if (toggle) {\n" +
        "        document.getElementById(\"mySidenav\").style.width = \"0\";\n" +
        "      } else {\n" +
        "        document.getElementById(\"mySidenav\").style.width = \"300px\";\n" +
        "      }\n" +
        "      toggle = 1 - toggle;\n" +
        "    };";
    document.head.appendChild(js);

}

function parseID(lectureIDList) {
    let idList = {};
    for (let i = 0; i < lectureIDList.length; i++) {
        let id = lectureIDList[i].lectureID;
        idList[id] = lectureIDList[i].lectureName;
    }
    console.log(idList);
    return idList;
}

function sortKadai(parsedKadai) {
    console.log("s", parsedKadai.length);
    for (let i = 0; i < parsedKadai.length; i++) {
        let kadaiList = parsedKadai[i].kadaiList;
        kadaiList.sort(function (a, b) {
            if (a.dueTimeStamp < b.dueTimeStamp) return -1;
            if (a.dueTimeStamp > b.dueTimeStamp) return 1;
            if (a.kadaiTitle < b.kadaiTitle) return -1;
            if (a.kadaiTitle > b.kadaiTitle) return 1;
            return 0;
        });
        console.log(i, kadaiList);
        parsedKadai[i].kadaiList = kadaiList;
    }
    return parsedKadai;
}

function getTimeRemain(_remainTime) {
    let day   = Math.floor(_remainTime / (3600*24));
    let hours = Math.floor((_remainTime - (day * 3600 * 24)) / 3600);
    let minutes = Math.floor((_remainTime - (day * 3600*24+hours*3600)) / 60);

    return [day,hours,minutes]

}

function insertSideNav(parsedKadai, lectureIDList) {
    let idList = parseID(lectureIDList);
    parsedKadai = sortKadai(parsedKadai);

    let topbar = document.getElementById("mastHead");
    let hamburger = document.createElement('span');
    hamburger.id = "hamburger";
    hamburger.textContent = "☰";
    topbar.appendChild(hamburger);


    var parent = document.getElementById('container');
    var ref = document.getElementById('toolMenuWrap');
    var main_div = document.createElement('div');
    main_div.className = "sidenav";
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

    let header_list = ["締め切り２４時間以内", "締め切り５日以内", "締め切り１４日以内", "その他"];
    let header_color = ["danger", "warning", "success", "other"];

    var header = document.createElement('div');
    var header_title = document.createElement('span');
    header_title.className = "q";
    var list_container = document.createElement('div');
    list_container.className = "sidenav-list";
    var list_body = document.createElement('div');
    var h2 = document.createElement('h2');

    var p_date = document.createElement('p');
    p_date.className = "kadai-date";
    var remain = document.createElement('span');
    remain.className = "time-remain";
    // p_date.textContent="2020/06/02 23:55";
    var p_title = document.createElement('p');
    p_title.className = "kadai-title";
    // p_title.textContent="総合課題";

    main_div.appendChild(logo);
    main_div.appendChild(a);


    for (let i = 0; i < 4; i++) {
        // header begin //
        var C_header = header.cloneNode(true);
        var C_header_title = header_title.cloneNode(true);
        C_header.className = `sidenav-${header_color[i]}`;
        C_header_title.textContent = `${header_list[i]}`;
        main_div.appendChild(C_header);
        // header end //

        // list begin //
        var C_list_container = list_container.cloneNode(true);
        for (let item = 0; item < parsedKadai.length; item++) {
            let kadaiList = parsedKadai[item].kadaiList;
            let lectureID = parsedKadai[item].lectureID;

            var C_list_body = list_body.cloneNode(true);
            C_list_body.className = `kadai-${header_color[i]}`;

            let lectureName = idList[lectureID];
            if (lectureName === undefined) lectureName = "不明";

            var C_h2 = h2.cloneNode(true);
            C_h2.className = `lecture-${header_color[i]}`;
            C_h2.textContent = "" + lectureName;
            C_list_body.appendChild(C_h2);

            let cnt = 0;
            for (let id = 0; id < kadaiList.length; id++) {
                let date = p_date.cloneNode(true);
                let remain_time = remain.cloneNode(true);
                let title = p_title.cloneNode(true);

                let dueTime = kadaiList[id].dueTimeStamp;
                let _date = new Date(dueTime);
                let kadaiTitle = kadaiList[id].kadaiTitle;
                let dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ('00' + _date.getMinutes()).slice(-2);
                let timeRemain=getTimeRemain((dueTime-new Date().getTime())/1000);

                let daysUntilDue = diffDays(new Date().getTime(), dueTime);
                if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue >5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && i === 3)) {
                    date.textContent = "" + dispDue;
                    remain_time.textContent=`あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;
                    title.textContent = "" + kadaiTitle;
                    C_list_body.appendChild(date);
                    C_list_body.appendChild(remain_time);
                    C_list_body.appendChild(title);
                    cnt++;
                }
            }
            if (cnt > 0) {
                C_list_container.appendChild(C_list_body);
                C_header.appendChild(C_header_title);
            }


        }

        // list end //

        main_div.appendChild(C_list_container);
    }

    parent.insertBefore(main_div, ref);
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

function parseKadai(data) {
    let parsedKadai = [];
    let item = data.assignment_collection;
    for (let i = 0; i < item.length; i++) {
        let temp = {};
        let lecID = item[i].context;
        let kid = item[i].id;
        let title = item[i].title;
        let due = item[i].dueTime.time;
        // add only available kadai
        if (due <= new Date().getTime()) {
            continue;
        }
        let kadaiDict = {kid: kid, dueTimeStamp: due, kadaiTitle: title};

        // すでに科目がListにあるか見る
        const q = parsedKadai.findIndex((kadai) => {
            return (kadai.lectureID === lecID);
        });
        //無ければ新規作成
        if (q === -1) {
            temp.lectureID = lecID;
            temp.closestTime = due;
            temp.farthestTime = due;
            temp.kadaiList = [kadaiDict];
            parsedKadai.push(temp);
        } else {
            temp = parsedKadai[q];
            //一番期限がやばい課題のタイムスタンプを記録
            if (temp.closestTime > due) temp.closestTime = due;
            if (temp.farthestTime < due) temp.farthestTime = due;
            temp.kadaiList.push(kadaiDict);
            parsedKadai[q] = temp;
        }


    }
    return parsedKadai;
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
        // test
        insertSideNav(parsedKadai, getTabList());
        insertJS();
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


insertCSS();
main();


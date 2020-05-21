chrome.runtime.onMessage.addListener(function (msg) {
    $("body").css("background-color", msg.color);
});

function insertCSS() {
    let css = document.createElement('link');
    css.href = chrome.extension.getURL('custom-panda.css');
    document.body.appendChild(css);
}

const defaultTab = document.querySelectorAll('.nav-menu');
const defaultTabCount = Object.keys(defaultTab).length;
const otherSiteTab = document.querySelectorAll('#otherSiteList > li');
const otherSiteTabCount = Object.keys(otherSiteTab).length;

function diffDays(dt1, dt2) {

    let diff =(dt2 - dt1) / 1000;
    diff /= 3600*24;
    if(diff<0)diff=9999;
    return (diff);

}

function addNotificationBadge(lectureIDList, upToDateKadaiList) {
    const lectureIDCount = lectureIDList.length;

    //タブにある全科目を回す。
    for (let i = 0; i < lectureIDCount; i++) {
        // default Tab
        if (lectureIDList[i].type === 'default') {
            for (let j = 2; j < defaultTabCount; j++) {
                let lectureID = defaultTab[j].getElementsByTagName('a')[0].getAttribute('href').slice(-17);
                const q = upToDateKadaiList.findIndex((kadai) => {
                    return (kadai.lectureID === lectureID);
                });
                if (q !== -1) {
                    if (upToDateKadaiList[q].isUpdate === 1) {
                        defaultTab[j].classList.add('badge');
                    }
                    let daysUntilDue=diffDays(new Date().getTime(),upToDateKadaiList[q].closestTime);
                    console.log('daysuntil',daysUntilDue, lectureID)
                    if (daysUntilDue <= 1) {
                        defaultTab[j].classList.add('nav-danger');
                    }else if (daysUntilDue <= 5) {
                        defaultTab[j].classList.add('nav-warning');
                    }else if (daysUntilDue <= 14) {
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
                    let daysUntilDue=diffDays(new Date().getTime(),upToDateKadaiList[q].closestTime);
                    if (daysUntilDue <= 1) {
                        otherSiteTab[j].classList.add('nav-danger');
                    }else if (daysUntilDue <= 5) {
                        otherSiteTab[j].classList.add('nav-warning');
                    }else if (daysUntilDue <= 14) {
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
        let tmpTab = {}

        let lectureID = defaultTab[i].getElementsByTagName('a')[0].getAttribute('href').slice(-17);

        tmpTab.type = 'default';
        tmpTab.lectureID = lectureID;

        lectureIDList.push(tmpTab);

    }
    for (let i = 0; i < otherSiteTabCount; i++) {
        let tmpTab = {}
        let lectureID = otherSiteTab[i].getElementsByTagName('a')[0].getAttribute('href').slice(-17);

        tmpTab.type = 'otherSite';
        tmpTab.lectureID = lectureID;

        lectureIDList.push(tmpTab);

    }

    return lectureIDList;

}

function parseKadai(data) {
    //TODO: exclude submitted kadai
    let parsedKadai = []
    let item = data.assignment_collection;
    for (let i = 0; i < item.length; i++) {
        let temp = {}
        let lecID = item[i].context;
        let kid = item[i].id;
        let status = item[i].status;
        let title = item[i].title;
        let due = item[i].dueTime.time;
        // add only available kadai
        if (due <= new Date().getTime()) {
            continue;
        }
        let kadaiDict = {kid: kid, dueTimeStamp: due, kadaiTitle: title}

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
    console.log(parsedKadai);
    return parsedKadai;
}

function getKadaiFromPandA() {
    return $.ajax({
        url: "https://das82.com/my.json",
        // url: "https://panda.ecs.kyoto-u.ac.jp/direct/assignment/my.json",
        dataType: "json",
        type: "get",
        cache: false,
    });
}


function getKadaiFromStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (items) {
            resolve(items[key]);
        });
    });
}

function saveKadai(parsedKadai) {
    var date = new Date();
    let entity = {};

    entity.kadai = parsedKadai;
    entity.lastModified = date.getTime();
    chrome.storage.local.set(entity, function () {
        console.log('stored kadai');
    });
}

function saveHasNew(noticationList) {
    var date = new Date();
    let entity = {};

    entity.hasNewItem = noticationList;
    entity.lastModified = date.getTime();
    chrome.storage.local.set(entity, function () {
        console.log('stored hasNew');
    });
}

function createNotificationList(upToDateKadaiList, hasNewItem) {
    let notificationList=[];

    for (let i=0;i<upToDateKadaiList.length;i++){
        let tmp=upToDateKadaiList[i];
        let lectureID=upToDateKadaiList[i].lectureID;
        if(typeof hasNewItem !== 'undefined'){

            const q = hasNewItem.findIndex((item) => {
                return (item.lectureID === lectureID);
            });

            if(q===-1){
                // 差分あり
                if (upToDateKadaiList[i].isUpdate===1){
                    tmp.isUpdate=1;
                }
                // 差分なし
                else{
                    tmp.isUpdate=0;
                }
            }else{
                let hasNew=hasNewItem[q].isUpdate;
                // 差分あり
                if (upToDateKadaiList[i].isUpdate===1){
                    tmp.isUpdate=1;
                }
                // 差分なし
                else{
                    //もし過去にupdateを確認してなかったら（hasNew=1だったら）引き続き1が入る。
                    //TODO: farthestTime が nowTimeより古ければisUpdate=0
                    tmp.isUpdate=hasNew;
                }

            }
        }else{
            // 差分あり
            if (upToDateKadaiList[i].isUpdate===1){
                tmp.isUpdate=1;
            }
            // 差分なし
            else{
                tmp.isUpdate=0;
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
        let tmp = {}
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

function main() {
    // 1. Get latest kadai
    getKadaiFromPandA().done(function (result) {
        let parsedKadai = parseKadai(result);
        // 2. Get old kadai from storage
        getKadaiFromStorage('kadai').then(function (storedKadai) {
            // 3. If there is no kadai in storege -> initialize
            console.log('fetch stored kadai', storedKadai);
            if (typeof storedKadai === 'undefined') {
                saveKadai(parsedKadai);
            } else {
                // 3. else compare latest and saved kadai list ->make uptodate list
                let upToDateKadaiList;
                upToDateKadaiList = compare(parsedKadai, storedKadai);
                console.log('uptodate', upToDateKadaiList);

                // 4. Get visited history
                getKadaiFromStorage('hasNewItem').then(function (hasNewItem) {
                    //
                    console.log('fetch stored hasNewItem', hasNewItem);

                    let notificationList = createNotificationList(upToDateKadaiList, hasNewItem);
                    console.log('notificationList', notificationList);

                    saveHasNew(notificationList);

                    addNotificationBadge(getTabList(), notificationList);

                });
            }
        });
    });

}

insertCSS();
main();
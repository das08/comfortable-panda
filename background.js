function onGetAllKadaiRequest(msg) {
    if (msg.type === 'raw-get-all-kadai') {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('kadai', (item) => {
                resolve(item);
            });
        });
    }
}

function onGetAllLectureInfoRequest(msg) {
    if (msg.type === 'raw-get-all-lecture-info') {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('lectureInfo', (item) => {
                resolve(item);
            });
        });
    }
}

function onGetLastKadaiUpdateTime(msg) {
    if (msg.type === 'raw-get-last-kadai-update-time') {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('lastKadaiGetTime', (item) => {
                resolve(item);
            });
        });
    }
}

chrome.runtime.onMessageExternal.addListener(onGetAllKadaiRequest);
chrome.runtime.onMessageExternal.addListener(onGetAllLectureInfoRequest);
chrome.runtime.onMessageExternal.addListener(onGetLastKadaiUpdateTime);

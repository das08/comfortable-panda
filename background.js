function onGetAllKadaiRequest(msg) {
    if (msg.type === 'get-all-kadai') {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('kadai', (item) => {
                resolve(item);
            });
        });
    }
}

browser.runtime.onMessageExternal.addListener(onGetAllKadaiRequest);

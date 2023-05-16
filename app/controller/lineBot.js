const line = require('@line/bot-sdk')

// 載入環境變數
require('dotenv').config()

// Line Bot 的相關設定
const config = {
    channelID: process.env.CHANNEL_ID,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
}

// 建立 Line Bot 的 client 實例
const client = new line.Client(config);
exports.client = client;

client.getWebhookEndpointInfo().then(res => {
    console.log(18,res);
})

//# 圖片訊息
/**
 * 
 * @param {string} lineId (可輸入userId 或是 groupId)
 * @param {string} url 為點開預覽圖後的瀏覽內容(jpg,png,gif)
 */
function sendImageMessage(lineId, url) {
    if (typeof lineId !== 'string' || typeof originalContentUrl !== 'string' || typeof previewImageUrl !== 'string') return;
    let sendTime = new Date().toLocaleString();

    //# 指定回傳對象(可輸入userId 或是 groupId)
    client.pushMessage(lineId, {
        type: 'image',
        originalContentUrl: url,
        previewImageUrl: url,
    })
        .then(() => {
            //# 此處放置log 紀錄回傳對象跟訊息
            console.log(`\n@sendImageMessage(${sendTime})[成功]\n傳送對象 ➫ ${lineId}\n傳送照片連結 ➫ |store|${store} 、|link| https://linetest2.guestdemo.art/images/${store}_menu.jpg\n\n`);
        })
        .catch((err) => {
            //# 此處放置log 紀錄回傳對象跟訊息
            console.log(`\n@sendImageMessage(${sendTime})[失敗]\n傳送對象 ➫ ${lineId}\n傳送照片連結 ➫ |store|${store} 、|link| https://linetest2.guestdemo.art/images/${store}_menu.jpg\n\n`);
        });;


}
exports.sendImageMessage = sendImageMessage;

//# 文字訊息
function sendTextMessage(lineId, message, userId) {
    if (typeof lineId !== 'string' || typeof message !== 'string') return;

    //# 指定回傳對象(可輸入userId 或是 groupId)
    client.pushMessage(lineId, {
        type: 'text',
        text: message,
    });

    //* 記錄並儲存回應訊息
    const { insertRecord } = require('../utils/fetch/order')
    const body = {
        uid:userId, 
        groupId:lineId,
        msg:message,
        input_json:JSON.stringify(message),
        data_flow:'out' 
    };
    insertRecord(body)

    //# 此處放置log 紀錄回傳對象跟訊息
    console.log(`\n@sendTextMessage(${new Date().toLocaleString()})\n傳送對象 ➫ ${lineId}\n傳送訊息 ➫ ${message}\n\n`);
}
exports.sendTextMessage = sendTextMessage;


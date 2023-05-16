const { client } = require('./lineBot')


const { insertRecord } = require('../utils/fetch/order')
const { account, order } = require('../model');

//# 全形轉半形
function fullToHalf(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c >= 0xff01 && c <= 0xff5e) {
            c -= 0xfee0;
        }
        result += String.fromCharCode(c);
    }
    return result;
}

module.exports = (app) => {

    // 設定 Line Bot 的 Webhook 路由
    app.post('/webhook', (req, res) => {
        const events = req.body.events;
        events.forEach((event) => {
            if (event.type === 'message' && event.message.type === 'text') {
                console.log("source", event);
                const userId = event.source.userId; // ➫ 使用者的LineID
                const groupId = event.source.groupId;// ➫ 使用者的群組LineID
                const targetId = groupId ? groupId : userId;
                const timestamp = event.timestamp;
                const originalMessage = event.message.text;

                //* 記錄所有訊息
                const body = {
                    uid:userId, 
                    groupId,
                    msg:originalMessage,
                    input_json:JSON.stringify(event),
                    data_flow:'in' 
                };
                insertRecord(body)

                // 回應訊息給使用者
                function reply(replyMessage) {
                    client.replyMessage(event.replyToken, { type: 'text', text: replyMessage })
                        .catch((err) => {
                            console.error(err);
                        });
                }

                let requireMessage = fullToHalf(event.message.text);

                requireMessage = requireMessage.split(" ");
                console.log("|訊息全文|", requireMessage);

                //# 比對生成相對應的指令
                let action = {
                    //#指令
                    "指令": "指令",
                    //#帳戶指令
                    "帳戶指令": "帳戶指令",
                    //#點餐指令
                    "點餐指令": "點餐指令",
                    //#註冊
                    "註冊": "註冊",
                    //#我誰
                    "我誰": "我誰",
                    //#查看餘額
                    "查看餘額": "查看餘額",
                    //#儲值
                    "儲值": "儲值",
                    "提領": "提領",
                    "結算": "結算",
                    //#開始點餐 => OK
                    "開啟訂餐": "開啟訂餐",
                    "開始點餐": "開啟訂餐",
                    "點餐": "開啟訂餐",
                    "!{": "開啟訂餐",
                    "!渴了": "開啟訂餐",
                    "!餓了": "開啟訂餐",
                    "!吃飯": "開啟訂餐",
                    //#點餐
                    // "": "",
                    //#幫點餐
                    "代": "代",
                    //#刪除點餐
                    "刪除點餐": "刪除點餐",
                    "刪除": "刪除點餐",
                    //#菜單
                    "菜單": "菜單",
                    //#查看點餐
                    "查看": "查看點餐",
                    "查看點餐": "查看點餐",
                    "查看餐點": "查看點餐",
                    "確認": "查看點餐",
                    "確認餐點": "查看點餐",
                    "確認點餐": "查看點餐",
                    "!!": "查看點餐",
                    //#結束訂單
                    "結束訂單": "結束訂單",
                    "結束點餐": "結束訂單",
                    "關閉點餐": "結束訂單",
                    "!}": "結束訂單",
                    //#整筆退款
                    "整筆退款": "整筆退款",
                    "退款": "整筆退款",
                }

                let commit = action[requireMessage[0]];
                console.log(commit, requireMessage[0]);

                switch (commit) {
                    //➫ 帳號指令
                    case "註冊"://!OK
                        account.register(targetId, userId, requireMessage[1]);
                        break;

                    case "我誰"://!OK
                        account.whoAmI(targetId, userId);
                        break;

                    // case "儲值":
                    //     account.savingMoney(targetId,userId,requireMessage[1],requireMessage[2],originalMessage)
                    //     break;

                    // case "提領":
                    //     account.withdrawalMoney(targetId,userId,requireMessage[1],requireMessage[2],originalMessage)
                    //     break;

                    // case "結算":
                        // account.settleTheBill(targetId,groupId,userId,originalMessage)
                    //     break;

                    //➫ ========================== //
                    //➫ 點餐指令:
                    // 開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯
                    case "開啟訂餐":
                        order.startNewGroupOrder(targetId,groupId,userId,requireMessage[1])
                        break;

                    // case "":
                    //     order.makeGroupOrder(targetId,groupId,userId,requireMessage[1],requireMessage[2],requireMessage[3],requireMessage)
                    //     break;

                    case "代":
                        order.helpMakeGroupOrder(targetId,groupId,userId,requireMessage[1],requireMessage[2],requireMessage[3],requireMessage[4],requireMessage)
                        break;

                    case "刪除點餐":
                        order.closeGroupOrder(targetId,groupId,requireMessage[1],userId)
                        break;

                    // case "菜單":

                    //     break;

                    case "查看點餐":
                        order.searchGroupOrder(targetId,groupId,userId)
                        break;

                    case "結束訂單":
                        order.overGroupOrder(targetId, groupId, userId, originalMessage);
                        break;
                    case "整筆退款":
                        order.cancelOrder(targetId, groupId, userId, originalMessage,requireMessage[1]);
                        break

                    //➫ 指令集
                    case "指令":
                        reply(
                            `|指令|
➫ 帳戶指令
➫ 餐點指令

|帳戶|\n
➫ 註冊 {暱稱}\n
➫ 我誰\n\n

|點餐指令|\n
➫ 開啟訂餐 {商家名稱} \n
(開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)\n\n

➫ {餐點} \${金額}\n
➫ 代 {暱稱} {餐點} \${金額}\n
➫ 刪除點餐 {訂餐編號} \n

➫ 菜單 {商店名稱} \n\n

➫ 查看點餐 \n
(查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)\n\n

➫ 結束訂單 \n
(結束訂單、結束點餐、關閉點餐、!})`)
const commentItem = {
    uid:userId, 
    groupId,
    msg:                            `|指令|
    ➫ 帳戶指令
    ➫ 餐點指令
    
    |帳戶|\n
    ➫ 註冊 {暱稱}\n
    ➫ 我誰\n\n
    
    |點餐指令|\n
    ➫ 開啟訂餐 {商家名稱} \n
    (開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)\n\n
    
    ➫ {餐點} \${金額}\n
    ➫ 代 {暱稱} {餐點} \${金額}\n
    ➫ 刪除點餐 {訂餐編號} \n
    
    ➫ 菜單 {商店名稱} \n\n
    
    ➫ 查看點餐 \n
    (查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)\n\n
    
    ➫ 結束訂單 \n
    (結束訂單、結束點餐、關閉點餐、!})`,
    input_json:JSON.stringify(                            `|指令|
    ➫ 帳戶指令
    ➫ 餐點指令
    
    |帳戶|\n
    ➫ 註冊 {暱稱}\n
    ➫ 我誰\n\n
    
    |點餐指令|\n
    ➫ 開啟訂餐 {商家名稱} \n
    (開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)\n\n
    
    ➫ {餐點} \${金額}\n
    ➫ 代 {暱稱} {餐點} \${金額}\n
    ➫ 刪除點餐 {訂餐編號} \n
    
    ➫ 菜單 {商店名稱} \n\n
    
    ➫ 查看點餐 \n
    (查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)\n\n
    
    ➫ 結束訂單 \n
    (結束訂單、結束點餐、關閉點餐、!})`),
    data_flow:'out' 
};
insertRecord(commentItem)
                        break;
                    //# 帳戶指令
                    case "帳戶指令":
                        reply(
                            `|帳戶|
➫ 註冊 暱稱 \n(EX:註冊 KO)
(暱稱不能重複)
➫ 我誰`)
// ➫ 查看餘額
// ➫ 儲值 暱稱 金額 \n(EX:儲值 KO $100)
// ➫ 提領 暱稱 金額 \n(EX:提領 KO $100)
// ➫ 結算`)
const accountItem = {
    uid:userId, 
    groupId,
    msg:`|帳戶|
    ➫ 註冊 暱稱 \n(EX:註冊 KO)
    (暱稱不能重複)
    ➫ 我誰`,
    input_json:JSON.stringify(`|帳戶|
    ➫ 註冊 暱稱 \n(EX:註冊 KO)
    (暱稱不能重複)
    ➫ 我誰`),
    data_flow:'out' 
};
insertRecord(accountItem)
                        break;
                    //# 點餐指令
                    case "點餐指令":
                        reply(
                            `|點餐指令|
                            ➫ 開啟訂餐 商家名稱 \n(EX:開啟訂餐 麻古)
                            (可使用指令：開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)

                            ➫ 點餐 餐點 金額 \n(EX:點餐 金萱(無糖少冰) $100)

                            ➫ 代 暱稱 餐點 金額 \n(EX:幫點餐 KO 金萱(無糖少冰) $100)

                            ➫ 刪除點餐 訂餐編號 \n(EX:刪除點餐 1987)

                            ➫ 菜單 商店名稱 \n(EX:菜單 麻古)

                            ➫ 查看點餐 \n(EX:查看點餐)
                            (可使用指令：查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)

                            ➫ 結束訂單 \n(EX:結束訂單)
                            (可使用指令：結束訂單、結束點餐、關閉點餐、!})`)
                            const orderItem = {
                                uid:userId, 
                                groupId,
                                msg:`|點餐指令|
                                ➫ 開啟訂餐 商家名稱 \n(EX:開啟訂餐 麻古)
                                (可使用指令：開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)
    
                                ➫ 點餐 餐點 金額 \n(EX:點餐 金萱(無糖少冰) $100)
    
                                ➫ 代 暱稱 餐點 金額 \n(EX:幫點餐 KO 金萱(無糖少冰) $100)
    
                                ➫ 刪除點餐 訂餐編號 \n(EX:刪除點餐 1987)
    
                                ➫ 菜單 商店名稱 \n(EX:菜單 麻古)
    
                                ➫ 查看點餐 \n(EX:查看點餐)
                                (可使用指令：查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)
    
                                ➫ 結束訂單 \n(EX:結束訂單)
                                (可使用指令：結束訂單、結束點餐、關閉點餐、!})`,
                                input_json:JSON.stringify(`|點餐指令|
                                ➫ 開啟訂餐 商家名稱 \n(EX:開啟訂餐 麻古)
                                (可使用指令：開啟訂餐、開始點餐、點餐、!{、!渴了、!餓了、!吃飯)
    
                                ➫ 點餐 餐點 金額 \n(EX:點餐 金萱(無糖少冰) $100)
    
                                ➫ 代 暱稱 餐點 金額 \n(EX:幫點餐 KO 金萱(無糖少冰) $100)
    
                                ➫ 刪除點餐 訂餐編號 \n(EX:刪除點餐 1987)
    
                                ➫ 菜單 商店名稱 \n(EX:菜單 麻古)
    
                                ➫ 查看點餐 \n(EX:查看點餐)
                                (可使用指令：查看點餐、查看、查看餐點、確認、確認餐點、確認點餐、!!)
    
                                ➫ 結束訂單 \n(EX:結束訂單)
                                (可使用指令：結束訂單、結束點餐、關閉點餐、!})`),
                                data_flow:'out' 
                            };
                            insertRecord(orderItem)
                        break;


                        //! 點餐新增
                    default:
                        if(requireMessage[1].slice(0,1) === '$'){
                            // 基本點餐
                            order.makeGroupOrder(targetId,groupId,userId,requireMessage[0],requireMessage[1],requireMessage[2],requireMessage)
                        }
                        break;


                }
            }
        });
        res.sendStatus(200);

    })

}
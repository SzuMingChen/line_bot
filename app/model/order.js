`
|點餐指令|
➫ 開啟訂餐 店名 (回復：已開啟，團購編號、店名)
➫ 點餐 團購編號 品項 $100 備註
➫ 幫點餐 暱稱 團購編號 品項 $100 備註
➫ 刪除 訂單編號
➫ 結單 團購編號
➫ 我點了什麼 #編號 (回覆：團購編號、訂單編號、品項、價錢、備註)
➫ 有哪些團 團購編號
➫ 這團點了什麼 團購編號
`

let bind_account_type = "LINE";
const { createAccount, getUserInfoByUid, getUserInfoByName, updateMoney } = require('../utils/fetch/account')
const { createOrder, createGroupOrder, getGroupOrderInfo, deleteGroupOrder, getAllGroupOrders,getArrangeOrderInfo, getTotalMoney, closeOrder, changeStatus, getOldOrders, addOrderText } = require('../utils/fetch/order')
const { settleMoney } = require('../utils/fetch/account')

const line = require('../controller/lineBot');
const { sendImageMessage, sendTextMessage } = line;

const sendMsgErr = "系統異常，請聯絡客服";
// const accessDeniedMsgErr = "權限不足，請聯絡客服";
const commandError = "指令格式錯誤，可透輸入「指令」獲取正確指令。";
// const groupAccessErr = "我的點餐功能只能在群組裡面執行唷";
// const accessCode = 5;

//# 轉換時間函式
function transformTime(originalTime) {
    const utcTime = new Date(originalTime);

// 取得台灣時間
const taiwanTime = new Date(utcTime.getTime() + 8 * 60 * 60 * 1000);

// 取得年、月、日、時、分、秒
const year = taiwanTime.getUTCFullYear();
const month = (taiwanTime.getUTCMonth() + 1).toString().padStart(2, "0");
const day = taiwanTime.getUTCDate().toString().padStart(2, "0");
const hours = taiwanTime.getUTCHours().toString().padStart(2, "0");
const minutes = taiwanTime.getUTCMinutes().toString().padStart(2, "0");
const seconds = taiwanTime.getUTCSeconds().toString().padStart(2, "0");

// 格式化時間字串
return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//# 開啟訂餐
exports.startNewGroupOrder = async (targetId, groupId, userId, storeName) => {
    let replyMessage = "";
    console.log(49,storeName);
    
    let getOrderFetchBody = {
        groupId
    };
    
    let fetchBody = {
        groupId,
        userId,
        storeName
    }
    
    try {
        if (storeName === undefined) throw "若要開啟新訂單\n請在指令後加上 {店家名稱}"
        //step Fetch 檢查該群組是否已開啟訂餐
        const [success, result] = await getGroupOrderInfo(getOrderFetchBody)
        if (!success) {
            if (result.code === "0403") throw `${result.data.id} \n已有開啟的訂單，請直接點餐`;
            // if (result.code === "0403") throw `｜目前已開放點餐｜ \n◈ ${result.data.store_name} ◈\n請透過以下指令進行點餐。\n ➫ 點餐 餐點 金額 備註 \n(EX:點餐 金萱 $100 無糖少冰)`;
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        //step Fetch 開啟訂餐
        const [orderSuccess, orderResult] = await createGroupOrder(fetchBody)
        if (!orderSuccess) {
            if (orderResult.code === "0503") throw `好，開啟了，請直接點餐`;
            // if (orderResult.code === "0503") throw `｜目前已開放點餐｜ \n◈ ${fetchBody.storeName} ◈\n請透過以下指令進行點餐。\n ➫ 點餐 餐點 金額 備註 \n(EX:點餐 金萱 $100 無糖少冰)`;
            if (orderResult.code === "0203") throw "禁止幽靈人口點餐，請先註冊";
            throw `[#${orderResult.code}] ${sendMsgErr}。`
        }
        return sendTextMessage(targetId, `好，開啟了，請直接點餐`, userId);
        // return sendTextMessage(targetId, `｜開啟 ◈ ${storeName} ◈ 訂餐｜\n請透過以下指令進行點餐。\n ➫ 點餐 餐點 金額 備註 \n(EX:點餐 金萱 $100 無糖少冰)`);
    } catch (error) {
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 點餐
exports.makeGroupOrder = async (targetId, groupId, userId, orderItem, price, remark, requireMessage) => {
    let replyMessage = "";
    if (!groupId) return;
    
    let msg = requireMessage.join(' ');

    try {
        if (price === undefined || orderItem === undefined) throw commandError;
        const balanceSymbol = price.charAt(0); //# 異動符號
        const balanceAmount = price.slice(1); //# 異動金額
        if (balanceSymbol !== "$" || isNaN(Number(balanceAmount))) throw commandError;

        let fetchBody = {
            groupId,
            userId,
            msg,
            orderItem,
            price: balanceAmount,

        };

        remark ? fetchBody.remark = remark : null;



        //step Fetch 點餐下單
        const [success, result] = await createOrder(fetchBody)
        console.log(130, result);
        if (!success) {
            if (result.code === "0203") throw "禁止幽靈人口點餐，請先註冊";
            // if (result.code === "0503") return;
            if (result.code === "0503") throw "尚未開啟訂單，請先開啟訂單再點餐";
            // if (result.code === "0203") throw "您尚未註冊，請透過以下指令進行註冊。\n ➫ 註冊 暱稱 \n(EX:註冊 KO)";
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        let orderId = `${result.data.orderId}`.padStart(4, 0);
        return sendTextMessage(targetId, `收`, userId);
        // return sendTextMessage(targetId, `收，訂單編號 ➫ ${orderId}`);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 幫點餐
exports.helpMakeGroupOrder = async (targetId, groupId, userId, targetName, orderItem, price, remark, requireMessage) => {
    let replyMessage = "";
    if (!groupId) return;
    
    let msg = requireMessage.slice(2).join(' ');

    let getUserFetchBody = {
        name: targetName
    }

    try {
        if (targetName === undefined || price === undefined || orderItem === undefined) throw commandError;

        const balanceSymbol = price.charAt(0); //# 異動符號
        const balanceAmount = price.slice(1); //# 異動金額
        console.log(price,balanceSymbol,balanceAmount);
        if (balanceSymbol !== "$" || isNaN(Number(balanceAmount))) throw commandError;

        let fetchBody = {
            groupId,
            userId,
            msg,
            orderItem,
            price: balanceAmount,
            remark,
            name: targetName
        };

        remark ? fetchBody.remark = remark : null;

        //step Fetch 查找是否有該使用者
        const [targetSuccess, targetResult] = await getUserInfoByName(getUserFetchBody);
        console.log(targetResult);
        if (!targetSuccess) {
            if (targetResult.code === "0204") throw "禁止幫幽靈人口點餐，請他/她/它/牠先註冊";
            throw `[#${targetResult.code}] ${sendMsgErr}。`
        }


        //step Fetch 點餐下單
        const [success, result] = await createOrder(fetchBody)
        console.log(result);
        if (!success) {
            if (result.code === "0503") throw "尚未開啟訂單，請先開啟訂單再點餐";
            if (result.code === "0203") throw "禁止幫幽靈人口點餐，請他/她/它/牠先註冊";
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        let orderId = `${result.data.orderId}`.padStart(4, 0);

        return sendTextMessage(targetId, `收`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 刪除點餐
exports.closeGroupOrder = async (targetId, groupId, orderId, userId) => {
    let replyMessage = "";

    let fetchBody = {
        groupId,
        orderId
    };
    
    try {
        //step Fetch
        const [success,result] = await deleteGroupOrder(fetchBody);
        console.log(result);
        if (!success) {
            if (result.code === "0502") throw "餐點不存在，請確認";
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        return sendTextMessage(targetId, `已刪除餐點`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 查看點餐
exports.searchGroupOrder = async (targetId, groupId, userId) => {
    let replyMessage = "";
    if (!groupId) return;

    let fetchBody = {
        groupId,
        orderListId:""
    };

    try {
        let groupOrderListText;
        //! 找進行中的訂單
        const [oderListSuccess, orderListResult] = await getGroupOrderInfo(fetchBody);//list
        console.log(248,oderListSuccess,orderListResult);
        if (orderListResult.code !== "0403") {//"0403","此群組有正在進行中的團購"
            //! 取得整理過的清單內容
            const [oderSuccess, orderResult] = await getOldOrders(fetchBody);
            if (orderResult.data === undefined) throw '沒有任何歷史訂單，也沒有正在進行中的訂單';
            console.log('$$$$####$$$$',orderResult.data);
            groupOrderListText = `沒有正在進行中的訂單\n以下是最近一筆結束的歷史訂單\n\n${orderResult.data[0].orders}`
            return sendTextMessage(targetId, groupOrderListText, userId);
        }
        let startTime = transformTime(orderListResult.data.createtime);// 時間格式轉換
        
        //step Fetch
        fetchBody.orderListId = orderListResult.data.id;
        console.log(262,fetchBody);
        const [success,result] = await getAllGroupOrders(fetchBody)//0503:訂單內容是空的
        if (result.code === "0503") {
            groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}`;
            groupOrderListText += `\n\n------訂單整理------\n空\n`;
            groupOrderListText += `\n總金額：0`
            return sendTextMessage(targetId, `${groupOrderListText}`, userId);
        }
        //*********************************** */


        //! 取得整理過的清單內容
        const [oderArrangesuccess, orderArrangeresult] = await getArrangeOrderInfo(fetchBody);
        // console.log(235,oderArrangesuccess);
        console.log(236,orderArrangeresult );
        if (!oderArrangesuccess && orderArrangeresult.code === "0504") {
            groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}`;
            groupOrderListText += `\n\n------訂單整理------\n空\n`;
            groupOrderListText += `\n總金額：0`
            return sendTextMessage(targetId, `${groupOrderListText}`, userId);
        }

        //! 取得訂單總金額
        const [moneySuccess, moneyResult] = await getTotalMoney(fetchBody);
        if (!moneySuccess && moneyResult.code === "0505") return;


        //! 轉換時間格式
        const taiwanTime = transformTime(orderListResult.data.createtime);
        const groupOrderList = result.data;
        groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${taiwanTime}\n`;
        for (let i = 0; i < groupOrderList.length; i++) {
            const {id,msg } = groupOrderList[i];
            let orderId = `${id}`.padStart(4, 0);

            groupOrderListText += `\n${orderId} ➫ ${msg}`
        }

        groupOrderListText += `\n\n------訂單整理------\n`;
        //! 加入整理
        for (let i = 0; i < orderArrangeresult.data.length; i++) {
            const {order_item, amount} = orderArrangeresult.data[i];
            let order = `${order_item}：${amount}`;

            groupOrderListText += `\n${order}`
            
        }

        //! 加上總金額
        const totalMoney = moneyResult.data.total_amount;
        groupOrderListText += `\n總金額：${totalMoney}`

        
        return sendTextMessage(targetId, `${groupOrderListText}`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 結束訂單
exports.overGroupOrder = async (targetId, groupId, userId, originalMessage) => {
    let replyMessage = "";
    if (!groupId) return;

    let fetchBody = {
        groupId,
        userId,
        originalMessage,
        orderListId:""
    };

    try {
        const [oderListSuccess, orderListResult] = await getGroupOrderInfo(fetchBody);
        if (orderListResult.code !== "0403") throw "沒有正在進行中的訂單" //"0403","此群組有正在進行中的團購"
        console.log(338,oderListSuccess,orderListResult);

        //! 有正在進行的團購
        fetchBody.orderListId = orderListResult.data.id;
        //step Fetch
        const [success,result] = await getAllGroupOrders(fetchBody)//0503:訂單內容是空的
        let groupOrderListText;
        let startTime = transformTime(orderListResult.data.createtime);// 時間格式轉換
        let endTime = transformTime(new Date());
        
        //******************************* */
        if (!success && result.code === "0503") {
            groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}`;
            groupOrderListText += `\n\n------訂單整理------\n空\n`;
            groupOrderListText += `\n總金額：0`
            return sendTextMessage(targetId, `${groupOrderListText}`, userId);
        }
        //*********************************** */


        //! 取得整理過的清單內容
        const [oderArrangesuccess, orderArrangeresult] = await getArrangeOrderInfo(fetchBody);

        if (!oderArrangesuccess && orderArrangeresult.code === "0504") {
            groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}\n訂單結束時間：\n${endTime}\n`;
            groupOrderListText += `\n\n------訂單整理------\n空\n`;
            groupOrderListText += `\n總金額：0`
            return sendTextMessage(targetId, `${groupOrderListText}`, userId);
        }

        //! 取得訂單總金額
        const [moneySuccess, moneyResult] = await getTotalMoney(fetchBody);
        if (!moneySuccess && moneyResult.code === "0505") return;


        //! 轉換時間格式
        const taiwanTime = transformTime(orderListResult.data.createtime);
        const groupOrderList = result.data;//!!!
        groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${taiwanTime}\n訂單結束時間：\n${endTime}\n`;
        for (let i = 0; i < groupOrderList.length; i++) {
            const {id,msg } = groupOrderList[i];
            let orderId = `${id}`.padStart(4, 0);

            groupOrderListText += `\n${orderId} ➫ ${msg}`
        }

        groupOrderListText += `\n\n------訂單整理------\n`;
        //! 加入整理
        for (let i = 0; i < orderArrangeresult.data.length; i++) {
            const {order_item, amount} = orderArrangeresult.data[i];
            let order = `${order_item}：${amount}`;

            groupOrderListText += `\n${order}`
            
        }

        //! 加上總金額
        const totalMoney = moneyResult.data.total_amount;
        groupOrderListText += `\n總金額：${totalMoney}`
        
        
        //! 異動錢包
        let fetchData = {
            create_uid:userId,
            msg: originalMessage,
            data:[]
        }
        for (let i = 0; i < groupOrderList.length; i++) {
            let pushData = {
                id:groupOrderList[i].id,
                target_name:groupOrderList[i].name,
                balance_amount: -groupOrderList[i].price,
                edit_reason:"餐點扣款"
            }
            fetchData.data.push(pushData);
        }

        const [editMoneySuccess, editMoneyResult] = await updateMoney(fetchData);
        if (editMoneyResult.code === "0204") {
            groupOrderListText += `整筆訂單自動扣款失敗\n找不到：${editMoneyResult.data}這些人`;
        }
        if (editMoneyResult.code === "0205") {
            groupOrderListText += `整筆訂單自動扣款失敗`;
        }
        //! 變更訂單狀態成關閉
        const [closeSuccess, closeResult] = await closeOrder(fetchBody);
        if (closeResult.code === "0401" ||closeResult.code === "0402") {
            groupOrderListText += `自動扣款成功，但是訂單關閉失敗`;
        }
        
        //! 把order_info的status改成2
        const [statusSuccess, statusResult] = await changeStatus(fetchData);
        console.log(416, statusSuccess, statusResult);
        if (statusResult.code !== "0001") {
            groupOrderListText += `訂單編號更改狀態失敗`;
        }

        //! 把回覆的訊息記錄到order_list的orders裡面
        let textData = {
            text:groupOrderListText,
            id:orderListResult.data.id
        }
        console.log(436, textData);
        const [addOrderTextSuccess, addOrderTextResult] = await addOrderText(textData);
        console.log(438,addOrderTextSuccess,addOrderTextResult);
        

        return sendTextMessage(targetId, `${groupOrderListText}`, userId);


    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 整筆訂單退款
exports.cancelOrder = async (targetId, groupId, userId, orderListId, originalMessage) => {
    let replyMessage = "";
    if (!groupId) return;

    let fetchBody = {
        groupId,
        orderListId,
        userId,
        originalMessage,
        statusNum:'2',
    };

    try {

        //用order_list_id和group_id去order_info裡面撈status=2的資料
        //把price變成負的
        //原因變成整單退款
        //送給第二層更新帳戶錢包=>更新錢包異動紀錄=>updateMoney
        // const [oderListSuccess, orderListResult] = await getGroupOrderInfo(fetchBody);
        // if (orderListResult.code !== "0403") throw `沒有此訂單編號為 ${id} 的訂單` //"0403","此群組有正在進行中的團購"(意指有找到)
        // console.log(338,oderListSuccess,orderListResult);//orderListResult是找到的結果

        // //! 有正在進行的團購
        // fetchBody.orderListId = orderListResult.data.id;
        // //step Fetch
        // const [success,result] = await getAllGroupOrders(fetchBody)//0503:訂單內容是空的
        // let groupOrderListText;
        // let startTime = transformTime(orderListResult.data.createtime);// 時間格式轉換
        // let endTime = transformTime(new Date());
        
        // //******************************* */
        // if (!success && result.code === "0503") {
        //     groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}`;
        //     groupOrderListText += `\n\n------訂單整理------\n空\n`;
        //     groupOrderListText += `\n總金額：0`
        //     return sendTextMessage(targetId, `${groupOrderListText}`);
        // }
        // //*********************************** */


        // //! 取得整理過的清單內容
        // const [oderArrangesuccess, orderArrangeresult] = await getArrangeOrderInfo(fetchBody);

        // if (!oderArrangesuccess && orderArrangeresult.code === "0504") {
        //     groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${startTime}\n訂單結束時間：\n${endTime}\n`;
        //     groupOrderListText += `\n\n------訂單整理------\n空\n`;
        //     groupOrderListText += `\n總金額：0`
        //     return sendTextMessage(targetId, `${groupOrderListText}`);
        // }

        // //! 取得訂單總金額
        // const [moneySuccess, moneyResult] = await getTotalMoney(fetchBody);
        // if (!moneySuccess && moneyResult.code === "0505") return;


        // //! 轉換時間格式
        // const taiwanTime = transformTime(orderListResult.data.createtime);
        // const groupOrderList = result.data;//!!!
        // groupOrderListText = `訂餐編號：${orderListResult.data.id} \n訂單建立時間：\n${taiwanTime}\n訂單結束時間：\n${endTime}\n`;
        // for (let i = 0; i < groupOrderList.length; i++) {
        //     const {id,msg } = groupOrderList[i];
        //     let orderId = `${id}`.padStart(4, 0);

        //     groupOrderListText += `\n${orderId} ➫ ${msg}`
        // }

        // groupOrderListText += `\n\n------訂單整理------\n`;
        // //! 加入整理
        // for (let i = 0; i < orderArrangeresult.data.length; i++) {
        //     const {order_item, amount} = orderArrangeresult.data[i];
        //     let order = `${order_item}：${amount}`;

        //     groupOrderListText += `\n${order}`
            
        // }

        // //! 加上總金額
        // const totalMoney = moneyResult.data.total_amount;
        // groupOrderListText += `\n總金額：${totalMoney}`
        
        
        
        
        // //! 異動錢包
        // let fetchData = {
        //     create_uid:userId,
        //     msg: originalMessage,
        //     data:[]
        // }
        // for (let i = 0; i < groupOrderList.length; i++) {
        //     let pushData = {
        //         id:groupOrderList[i].id,
        //         target_name:groupOrderList[i].name,
        //         balance_amount: -groupOrderList[i].price,
        //         edit_reason:"餐點扣款"
        //     }
        //     fetchData.data.push(pushData);
        // }

        // const [editMoneySuccess, editMoneyResult] = await updateMoney(fetchData);
        // if (editMoneyResult.code === "0204") {
        //     groupOrderListText += `整筆訂單自動扣款失敗\n找不到：${editMoneyResult.data}這些人`;
        // }
        // if (editMoneyResult.code === "0205") {
        //     groupOrderListText += `整筆訂單自動扣款失敗`;
        // }
        // //! 變更訂單狀態成關閉
        // const [closeSuccess, closeResult] = await closeOrder(fetchBody);
        // if (closeResult.code === "0401" ||closeResult.code === "0402") {
        //     groupOrderListText += `自動扣款成功，但是訂單關閉失敗`;
        // }
        
        // //! 把order_info的status改成2
        // const [statusSuccess, statusResult] = await changeStatus(fetchData);
        // console.log(416, statusSuccess, statusResult);
        // if (statusResult.code !== "0001") {
        //     groupOrderListText += `訂單編號更改狀態失敗`;
        // }

        // //! 把回覆的訊息記錄到order_list的orders裡面
        // let textData = {
        //     text:groupOrderListText,
        //     id:orderListResult.data.id
        // }
        // console.log(436, textData);
        // const [addOrderTextSuccess, addOrderTextResult] = await addOrderText(textData);
        // console.log(438,addOrderTextSuccess,addOrderTextResult);
        

        // return sendTextMessage(targetId, `${groupOrderListText}`);


    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 整筆訂單退款

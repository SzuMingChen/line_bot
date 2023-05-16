`
|註冊|
➫ 註冊 帳號 暱稱(都不能重複)(成功、重複)

|帳戶|
➫ 我誰
➫ 查看餘額
➫ 儲值 名稱 $金額
➫ 結算 團購編號
➫ 全部結算
`
const { createAccount, getUserInfoByUid, getUserInfoByName, updateMoney, settleMoney } = require('../utils/fetch/account')

const line = require('../controller/lineBot');
const { sendImageMessage, sendTextMessage } = line;

const sendMsgErr = "系統異常，請聯絡客服";
// const accessDeniedMsgErr = "權限不足，請聯絡客服";
// const commandError = "指令格式錯誤，可透輸入「指令」獲取正確指令。";
const groupAccessErr = "我的點餐功能只能在群組裡面執行唷";
// const accessCode = 1;

//# 註冊
exports.register = async (targetId, userId, name) => {
    let replyMessage = "";
    console.log(targetId, name);
    let fetchBody = {
        uid: userId,
        name: name,
        level: 1,
    }

    try {
        const [findSuccess, findResult] = await getUserInfoByUid(fetchBody);
        console.log(findResult);
        if (name === undefined && findResult.code === "0203") throw "請告訴我名字謝謝";
        if (findResult === "0001") throw "已經註冊，請使用我";


        //step Fetch Register註冊
        const [success, result] = await createAccount(fetchBody)
        console.log(result);
  
        if (!success) {
            if (result.code === "0201") throw "已經註冊，請使用我";
            if (result.code === "0202") throw "名稱重複，請重新取名";
            throw `[#${result.code}] ${sendMsgErr}。`
        }


        return sendTextMessage(targetId, `註冊成功!\n歡迎 ${name} 的加入～`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 我誰
exports.whoAmI = async (targetId, userId) => {
    let replyMessage = "";
    let fetchBody = {
        uid: userId
    }

    try {
        //step Fetch
        const [success, result] = await getUserInfoByUid(fetchBody);
        console.log(result);
        if (!success) {
            if (result.code === "0203")  throw `好可憐，連自己是誰都不知道。`
        }

        const money = Number(result.data.money);
        const name = result.data.name;
        if (isNaN(money)) throw sendMsgErr;

        return sendTextMessage(targetId, `${name}您好，帳戶餘額${money}元`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 結算金額
exports.settleTheBill = async (targetId, groupId, userId,originalMessage) => {
    let replyMessage = "";

    let fetchBody = {
        groupId,
        msg:originalMessage,
        userId
    }

    try {
        if (groupId === undefined) throw groupAccessErr;

        //step Fetch
        const [success, result] = await settleMoney(fetchBody)
        console.log(result);
        if (!success) {
            if (result.code === "0101") throw "名稱重複，請重新取名";
            if (result.code === "0102") throw "已經註冊，請使用我";
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        return sendTextMessage(targetId, `回覆訊息 ➫ example`, userId);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage, userId);
        };

        sendTextMessage(targetId, sendMsgErr, userId);
    }
}

//# 查看餘額 => 用不到
/*
exports.checkMoney = async (targetId, userId) => {
    let replyMessage = "";
    let fetchBody = {
        uid: userId
    }

    try {
        //step Fetch
        const [success, result] = await getUserInfoByUid(fetchBody)
        if (!success) {
            if (result.code === "0203") throw "您尚未註冊，請透過以下指令進行註冊。\n ➫ 註冊 暱稱 \n(EX:註冊 KO)";
            throw `[#${result.code}] ${sendMsgErr}。`
        }

        const name = result.data.name;
        const money = Number(result.data.money);

        if (isNaN(money)) throw sendMsgErr;

        if (money >= 0) {
            return sendTextMessage(targetId, `${name}，你的餘額為 ${money}。`);
        } else {
            return sendTextMessage(targetId, `⚠️ ${name}，你的餘額為 ${money}，請盡快至櫃檯儲值。`);
        }


    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage);
        };

        sendTextMessage(targetId, sendMsgErr);
    }
}
*/


//# 儲值
/*exports.savingMoney = async (targetId, userId, targetName, inputAmount, originalMessage) => {
    let replyMessage = "";
    console.log(inputAmount);

    let getAdminFetchBody = {
        uid: userId
    }

    let getUserFetchBody = {
        name: targetName
    }

    try {
        if (targetName === undefined || inputAmount === undefined || originalMessage === undefined) throw commandError;

        const balanceSymbol = inputAmount.charAt(0); //# 異動符號
        const balanceAmount = inputAmount.slice(1); //# 異動金額
        if (balanceSymbol !== "$" || isNaN(Number(balanceAmount))) throw commandError;


        //step Fetch 檢查此用戶是否有權限進行儲值
        // const [adminSuccess, adminResult] = await getUserInfoByUid(getAdminFetchBody)
        // if (!adminSuccess) {
        //     if (adminResult.code === "0201") throw "請告訴我名字謝謝";
        //     throw `[#${adminResult.code}] ${sendMsgErr}。`
        // }
        //!確認過執行者權限後開始執行異動 => 目前所有人都可以儲值
        // if (adminResult.data.level > accessCode) throw accessDeniedMsgErr;

        //step Fetch 查找是否有該使用者
        const [targetSuccess, targetResult] = await getUserInfoByName(getUserFetchBody);
        if (!targetSuccess) {
            if (targetResult.code === "0204") throw "查無此人";
            throw `[#${targetResult.code}] ${sendMsgErr}。`
        }


        let balanceFetchBody = {
            create_uid: userId,
            msg: originalMessage,
            target_name: targetName,
            balance_amount: balanceAmount,
            edit_reason: "儲值",
        }

        //step Fetch 查找是否有該使用者
        const [balanceSuccess, balanceResult] = await updateMoney(balanceFetchBody);
        if (!balanceSuccess) {
            if (balanceResult.code === "0303") throw `儲值成功，請花錢`;
            if (balanceResult.code === "0101") throw "帳戶異常";
            throw `[#${balanceResult.code}] ${sendMsgErr}。`
        }
        return sendTextMessage(targetId,`儲值成功，請花錢`);
        // return sendTextMessage(targetId, `${targetName} 已成功儲值 $${balanceAmount}`);
    } catch (error) {
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage);
        };

        sendTextMessage(targetId, sendMsgErr);
    }
}
*/

//# 提領
/*
exports.withdrawalMoney = async (targetId, userId, targetName, inputAmount, originalMessage) => {
    let replyMessage = "";
    console.log(inputAmount);


    let getAdminFetchBody = {
        uid: userId
    }

    let getUserFetchBody = {
        name: targetName
    }



    try {
        if (targetName === undefined || inputAmount === undefined || originalMessage === undefined) throw commandError;

        const balanceSymbol = inputAmount.charAt(0); //# 異動符號
        const balanceAmount = inputAmount.slice(1); //# 異動金額
        if (balanceSymbol !== "$" || isNaN(Number(balanceAmount))) throw "指令格式錯誤，可透輸入「指令」獲取正確指令。";


        //step Fetch 檢查此用戶是否有權限進行儲值
        // const [adminSuccess, adminResult] = await getUserInfoByUid(getAdminFetchBody)
        // console.log(adminResult);
        // if (!adminSuccess) {
        //     if (adminResult.code === "0201") throw "請告訴我名字謝謝";
        //     throw `[#${adminResult.code}] ${sendMsgErr}。`
        // }
        //!確認過執行者權限後開始執行異動 => 目前所有人都可以執行
        // if (adminResult.data.level !== accessCode) throw accessDeniedMsgErr;

        //step Fetch 查找是否有該使用者
        const [targetSuccess, targetResult] = await getUserInfoByName(getUserFetchBody);
        console.log(232, targetResult);
        if (!targetSuccess) {
            if (targetResult.code === "0204") throw "查無此人";
            throw `[#${targetResult.code}] ${sendMsgErr}。`
        }


        let balanceFetchBody = {
            create_uid: userId,
            msg: originalMessage,
            target_name: targetName,
            balance_amount: -balanceAmount,
            edit_reason: "提領",
        }

        console.log(balanceFetchBody);
        //step Fetch 查找是否有該使用者
        const [balanceSuccess, balanceResult] = await updateMoney(balanceFetchBody)
        if (!balanceSuccess) {
            if (balanceResult.code === "0101") throw "帳戶異常";
            throw `[#${balanceResult.code}] ${sendMsgErr}。`
        }



        return sendTextMessage(targetId, `${targetName} 已成功提領 -$${balanceAmount}`);
    } catch (error) {
        console.log(error);
        if (typeof error === 'string') {
            replyMessage = error;
            return sendTextMessage(targetId, replyMessage);
        };

        sendTextMessage(targetId, sendMsgErr);
    }
}
*/
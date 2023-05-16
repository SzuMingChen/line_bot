require('dotenv').config()

const { fetch, method: { GET, POST, PUT, DELETE } } = require('../../lib/fetch');

let targetUser = process.env.FETCH_USER;
let targetAdmin = process.env.FETCH_ADMIN;

//# 註冊
exports.createAccount = async (body) => {
    const { uid, name, level } = body;

    const detail = {
        params: `/register`,
        body: {
            uid,
            name,
            level
        }
    }
    console.log(detail);
    return await fetch(POST, targetUser, detail);
}

//# 透過uid(lineId)去獲取帳號資訊
exports.getUserInfoByUid = async (body) => {
    const { uid } = body;

    const detail = {
        params: `/findAccount`,
        body: {
            uid,
        }
    }
    console.log(detail);
    return await fetch(POST, targetUser, detail);
}

//# 透過name(暱稱)去獲取帳號資訊
exports.getUserInfoByName = async (body) => {
    const { name } = body;

    const detail = {
        params: `/findAccount`,
        body: {
            name,
        }
    }
    console.log(detail);
    return await fetch(POST, targetUser, detail);
}

//# 編輯錢包
exports.updateMoney = async (body) => {
    const { create_uid, msg, data, target_name, balance_amount, edit_reason } = body;

    const detail = {
        params: `/updateMoney`,
        body: {
            create_uid,
            msg,
            data
        }
    }
    console.log(detail);
    return await fetch(POST, targetAdmin, detail);
}

(async () => {
    //   const [aa,bb] = await  this.updateMoney({ create_uid:"oifwjef", msg:"儲值", target_name:"KO", balance_amount:10000, edit_reason:"儲值" })
    //   console.log(aa,bb);


})()
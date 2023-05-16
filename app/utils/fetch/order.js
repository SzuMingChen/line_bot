require('dotenv').config()

const { fetch, method: { GET, POST, PUT, DELETE } } = require('../../lib/fetch');

let targetUser = process.env.FETCH_USER;
let targetAdmin = process.env.FETCH_ADMIN;
let targetOrder = process.env.FETCH_ORDER;
let targetRecord = process.env.FETCH_RECORD;

//* 紀錄訊息功能
exports.insertRecord = async (body) => {
    const { uid, groupId, msg, input_json, data_flow } = body;

    const detail = {
        params: '/createRecord',
        body: {
            uid,
            group_id: groupId,
            msg,
            input_json,
            data_flow
        }
    }
    console.log(detail);
    return await fetch(POST, targetRecord, detail);
}

//# 開啟訂餐
exports.createGroupOrder = async (body) => {
    const { groupId, userId, storeName } = body;

    const detail = {
        params: `/createNewOrder`,
        body: {
            group_id: groupId,
            create_uid: userId,
            store_name: storeName
        }
    }
    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 獲取群組訂餐資訊
exports.getGroupOrderInfo = async (body) => {
    const { groupId } = body;

    const detail = {
        params: `/getOrderList`,
        body: {
            group_id: groupId,
        }
    }
    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 獲取統計過整理過的群組訂餐資訊
exports.getArrangeOrderInfo = async (body) => {
    const { groupId, orderListId } = body;

    const detail = {
        params: `/arrangeOrders`,
        body: {
            group_id: groupId,
            order_list_id:orderListId
        }
    }
    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 獲取訂單總金額
exports.getTotalMoney = async (body) => {
    const { groupId, orderListId } = body;

    const detail = {
        params: `/totalMoney`,
        body: {
            group_id: groupId,
            order_list_id:orderListId
        }
    }
    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 點餐下單
exports.createOrder = async (body) => {
    const { groupId, userId, msg, orderItem, price, remark, name } = body;

    const detail = {
        params: `/orderItem`,
        body: {
            group_id: groupId,
            order_uid: userId,
            msg,
            order_item: orderItem,
            price,
        }
    }
    remark ? detail.body.remark = remark : null;
    name ? detail.body.name = name : null;

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 刪除訂單
exports.deleteGroupOrder = async (body) => {
    const { groupId, orderId } = body;

    const detail = {
        params: `/dropOrder`,
        body: {
            group_id: groupId,
            id: orderId,
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 更改訂單狀態
exports.changeStatus = async (body) => {
    const { data } = body;

    const detail = {
        params: `/changeStatus`,
        body: {
            data
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 關閉訂單
exports.closeOrder = async (body) => {
    const { groupId, userId } = body;

    const detail = {
        params: `/closeOrder`,
        body: {
            group_id: groupId,
            update_uid: userId,
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 將文字紀錄記錄到訂單的orders中
exports.addOrderText = async (body) => {
    const { text,id } = body;

    const detail = {
        params: `/addOrderText`,
        body: {
            text,
            id
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 查看訂單
exports.getAllGroupOrders = async (body) => {
    const { groupId,orderListId } = body;

    const detail = {
        params: `/getAllOrders`,
        body: {
            group_id: groupId,
            order_list_id: orderListId
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}

//# 查看前一筆訂單
exports.getOldOrders = async (body) => {
    const { groupId } = body;

    const detail = {
        params: `/findLastOrder`,
        body: {
            group_id: groupId
        }
    }

    console.log(detail);
    return await fetch(POST, targetOrder, detail);
}


(async () => {
    //   const [aa,bb] = await  this.getGroupOrderInfo({group_id:"Cbd558fac6ac31fc23a5bfc1fa67df6d9"})
    //   const [aa,bb] = await  this.getUserInfoByName({name:"KO222"})
    //   console.log(aa,bb);

})()
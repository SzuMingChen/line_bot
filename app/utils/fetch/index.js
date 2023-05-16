module.exports = {
    //➫【account系列】
    account: require('./account'),

    // //➫【User系列】
    // userWallet: require('./user-wallet'),
} 



//! 測驗中心
(async () => {
    let uid = "ggininder168";
    try {
        // const [successL, resultL] = await asyncLock.acquireLock({ type: "user", key: uid });
        // console.log(successL, resultL.data.uuid);

        // let [success, result] = await userWallet.addBalance({ target_uid: uid },{
        //     lockToken: resultL.data.uuid,
        //     point_id: "衣服點",
        //     point_amount: 50,
        //     source_uid: "admin01",
        //     msg: "兌換超級大獎",
        //     balance_type: "number",
        //     remark:"補給箱",
        //     update_uid: "admin01"
        // });
        // console.log(success, result);


    } catch (error) {
        console.log(error);
    }
})();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

//# FETCH ERROR #//
class HTTPResponseError extends Error {
    constructor(response) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`);
        this.response = response;
    }
}

const checkStatus = async (response) => {
    if (response.ok) {
        // response.status >= 200 && response.status < 300
        return await response.json();
    } else {
        throw new HTTPResponseError(response);
    }
}


//# 請求模式
//➫【修改日期】：2023/04/10
exports.method = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

//# 請求方法
//➫【修改日期】：2023/04/11
exports.fetch = async function (method, targetAddress, { params, query, body } = {}) {
    //setup URL
    let url = "";
    let urlParams = "";
    let urlQuery = "?";

    //setup Url
    if (typeof targetAddress !== 'string') {
        return [false, { msg: "targetAddress is not string" }]
    } else { url = targetAddress };
    if (typeof method !== 'string') return [false, { msg: "method is not string" }];
    if (typeof params !== 'string' && params !== undefined) return [false, { msg: "params is not string" }];
    if (typeof query !== 'object' && query !== undefined || Array.isArray(query)) return [false, { msg: "query is not object" }];
    if (typeof body !== 'object' && body !== undefined) return [false, { msg: "body is not object || array" }];

    //setup Params
    if (params) {
        // console.log("params",params);
        (params[0] !== "/") ? urlParams += `/${params}` : urlParams += `${params}`;
        // console.log("urlParams",urlParams);
        url += urlParams;
    }

    //setup Query
    if (query) {
        console.log("query", query);
        let count = 0;
        for (const key in query) {
            console.log("KEY", key, count);
            if (typeof query[key] === 'string' || typeof query[key] === 'number') {
                //# query帶入的內容超過1個以上的話都會自動帶入&
                (count > 0) ? urlQuery += `&${key}=${query[key]}` : urlQuery += `${key}=${query[key]}`;
                count++;
            } else {
                console.log(query[key]);
                return [false, { msg: `query key: ${key} value: ${JSON.stringify(query[key])} is not string || number ` }];
            }

        }
        // console.log("urlQuery", urlQuery);
        url += urlQuery;
    }
    // console.log(url);

    //setup Method
    try {
        let response;
        switch (method) {
            case 'GET':
                response = await fetch(url, { method });
                break;
            case 'POST':
                response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                break;
            case 'PUT':
                response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                break;
            case 'DELETE':
                response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                break;

            default:
                return [false, { msg: `no such of method ${method}` }]
                break;
        }

        // clog(`\n ◈◈fetch${method}◈◈   ※▶※▶※▶※▶ ${url} ◄※◄※◄※◄※`);

        const result = await checkStatus(response);
        if (result?.code !== "0001") throw result;
        return [true, result];
    } catch (error) {
        // console.error(error);
        // clog(`\n ✖✖fetch${method}✖✖ error ※▶※▶※▶※▶ ${error} ◄※◄※◄※◄※`);

        // const errorBody = await error.response.text();
        // console.error(`Error body: ${errorBody}`);
        return [false, error];
    }
    return "OK";
};




// //# FETCH AREA #//
// exports.fetchGET = async function ({ targetAddress, params, query } = {}) {
//     // console.log("拿到的", params);
//     let url = "";

//     // console.log(1);
//     if (targetAddress !== undefined && typeof targetAddress === 'string') { url += `${targetAddress}` }
//     else if (targetAddress !== undefined && typeof targetAddress !== 'string') { throw [false, "targetAddress input err"] };
//     // console.log("targetAddress =>", url);

//     // console.log(2);
//     if (params !== undefined && typeof params === 'string') { url += `/${params}` }
//     else if (params !== undefined && typeof params !== 'string') { throw [false, "params input err"] };
//     // console.log("Params =>", url);

//     // console.log(3);
//     if (query !== undefined && typeof query === 'string' && query[0] === "&") { url += `${query}` }
//     else if (query !== undefined && typeof query !== 'string' && query[0] !== "&") { throw [false, "query input err"] };
//     // console.log("Query =>", url);

//     try {
//         // console.log(4);
//         console.log(`\n ◈◈fetchGET◈◈   ※▶※▶※▶※▶ ${url} ◄※◄※◄※◄※`);
//         const response = await fetch(url);

//         return checkStatus(response);
//     } catch (error) {
//         // console.error(error);
//         console.log(`\n ✖✖fetchGET✖✖   ※▶※▶※▶※▶ ${error} ◄※◄※◄※◄※`);

//         // const errorBody = await error.response.text();
//         // console.error(`Error body: ${errorBody}`);
//         throw [false];
//     }


// }

// exports.fetchPOST = async function ({ targetAddress, params, query, body = {} } = {}) {
//     let url = "";

//     // console.log(1);
//     if (targetAddress !== undefined && typeof targetAddress === 'string') { url += `${targetAddress}` }
//     else if (targetAddress !== undefined && typeof targetAddress !== 'string') { throw [false, "targetAddress input err"] };
//     // console.log("targetAddress =>", url);

//     // console.log(2);
//     if (params !== undefined && typeof params === 'string') { url += `/${params}` }
//     else if (params !== undefined && typeof params !== 'string') { throw [false, "params input err"] };
//     // console.log("Params =>", url);

//     // console.log(3);
//     if (query !== undefined && typeof query === 'string' && query[0] === "&") { url += `${query}` }
//     else if (query !== undefined && typeof query !== 'string' && query[0] !== "&") { throw [false, "query input err"] };
//     // console.log("Query =>", url);


//     try {
//         // console.log(4);
//         console.log(`\n ◈◈fetchPOST◈◈   ※▶※▶※▶※▶ ${url} ◄※◄※◄※◄※`);
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(body),
//         });

//         return checkStatus(response);
//     } catch (error) {
//         // console.error(error);
//         console.log(`\n ✖✖fetchPOST✖✖   ※▶※▶※▶※▶ ${error} ◄※◄※◄※◄※`);

//         // const errorBody = await error.response.text();
//         // console.error(`Error body: ${errorBody}`);
//         throw [false];
//     }


// }

// exports.fetchPUT = async function ({ targetAddress, params, query, body = {} } = {}) {
//     let url = "";

//     // console.log(1);
//     if (targetAddress !== undefined && typeof targetAddress === 'string') { url += `${targetAddress}` }
//     else if (targetAddress !== undefined && typeof targetAddress !== 'string') { throw [false, "targetAddress input err"] };
//     // console.log("targetAddress =>", url);

//     // console.log(2);
//     if (params !== undefined && typeof params === 'string') { url += `/${params}` }
//     else if (params !== undefined && typeof params !== 'string') { throw [false, "params input err"] };
//     console.log("Params =>", url);

//     // console.log(3);
//     if (query !== undefined && typeof query === 'string' && query[0] === "&") { url += `${query}` }
//     else if (query !== undefined && typeof query !== 'string' && query[0] !== "&") { throw [false, "query input err"] };
//     // console.log("Query =>", url);


//     try {
//         // console.log(4);
//         console.log(`\n ◈◈fetchPUT◈◈   ※▶※▶※▶※▶ ${url} ◄※◄※◄※◄※`);
//         const response = await fetch(url, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(body),
//         });

//         return checkStatus(response);
//     } catch (error) {
//         // console.error(error);
//         console.log(`\n ✖✖fetchPUT✖✖   ※▶※▶※▶※▶ ${error} ◄※◄※◄※◄※`);

//         // const errorBody = await error.response.text();
//         // console.error(`Error body: ${errorBody}`);
//         throw [false];
//     }


// }

// exports.fetchDELETE = async function ({ targetAddress, params, query, body = {} } = {}) {
//     let url = "";

//     // console.log(1);
//     if (targetAddress !== undefined && typeof targetAddress === 'string') { url += `${targetAddress}` }
//     else if (targetAddress !== undefined && typeof targetAddress !== 'string') { throw [false, "targetAddress input err"] };
//     // console.log("targetAddress =>", url);

//     // console.log(2);
//     if (params !== undefined && typeof params === 'string') { url += `/${params}` }
//     else if (params !== undefined && typeof params !== 'string') { throw [false, "params input err"] };
//     // console.log("Params =>", url);

//     // console.log(3);
//     if (query !== undefined && typeof query === 'string' && query[0] === "&") { url += `${query}` }
//     else if (query !== undefined && typeof query !== 'string' && query[0] !== "&") { throw [false, "query input err"] };
//     // console.log("Query =>", url);


//     try {
//         // console.log(4);
//         console.log(`\n ◈◈fetchDELETE◈◈   ※▶※▶※▶※▶ ${url} ◄※◄※◄※◄※`);
//         const response = await fetch(url, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(body),
//         });

//         return checkStatus(response);
//     } catch (error) {
//         // console.error(error);
//         console.log(`\n ✖✖fetchDELETE✖✖   ※▶※▶※▶※▶ ${error} ◄※◄※◄※◄※`);
//         // const errorBody = await error.response.text();
//         // console.error(`Error body: ${errorBody}`);
//         throw [false];
//     }


// }
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')


// 設定 port
const PORT = process.env.PORT || 3000

// 設定 bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// 將 public 資料夾設定為存放靜態資源的目錄
const path = require('path')
app.use('/static',express.static(path.join(__dirname, './app/public')))

// 設定路由
app.get('/', (req, res) => {
    res.send('Hello World!')
})

require('./app/controller/line-bot')(app);

// 啟動 server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

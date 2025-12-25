const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 建立 HTTP 伺服器
const server = http.createServer(app);

// 建立 WebSocket 伺服器,掛載到同一個 HTTP 伺服器
const wss = new WebSocket.Server({ server });

// 提供 audience.html 的 HTML 內容
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'audience.html'));
});

// WebSocket 連線處理
wss.on('connection', (ws) => {
    console.log('新的 WebSocket 連線建立');
    
    // 監聽訊息
    ws.on('message', (message) => {
        // 解析訊息
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return; 
        }

        console.log('收到訊息:', data);

        // 廣播給所有連線者 (主要是給 Presenter)
        // 實際應用通常會區分 Room 或 Role，這裡簡化為全域廣播
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket 連線關閉');
    });
});

// 啟動伺服器
server.listen(PORT, () => {
    console.log(`簡報互動伺服器已啟動 (Port: ${PORT})`);
    console.log(`HTTP: http://localhost:${PORT}`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});
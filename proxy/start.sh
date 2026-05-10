#!/bin/bash

# DeepSeek API Proxy - 启动脚本（Linux/Mac）

PORT=3000

# 检查进程是否已在运行
if pgrep -f "node.*proxy.js" > /dev/null; then
    echo "Proxy already running"
    exit 1
fi

echo "Starting DeepSeek Proxy on http://127.0.0.1:$PORT"

# 启动代理
node proxy.js &

echo "Started successfully"
echo "The proxy is now running on http://127.0.0.1:$port"

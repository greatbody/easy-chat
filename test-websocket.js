/**
 * WebSocket 连接测试脚本
 * 用于测试 Easy Chat 的 WebSocket 连接是否正常工作
 */

// 配置
const SERVER_URL = 'localhost:8003'; // 修改为你的服务器地址
const TEST_USERNAME = 'TestUser_' + Math.random().toString(36).substr(2, 5);

console.log('🧪 开始测试 WebSocket 连接...');
console.log('服务器:', SERVER_URL);
console.log('测试用户名:', TEST_USERNAME);

// 检测协议
const protocol = SERVER_URL.includes('localhost') ? 'ws:' : 'wss:';
const wsUrl = `${protocol}//${SERVER_URL}/ws?username=${encodeURIComponent(TEST_USERNAME)}`;

console.log('WebSocket URL:', wsUrl);

// 创建 WebSocket 连接
const ws = new WebSocket(wsUrl);

let messageCount = 0;
let userListReceived = false;
let connectionTime = Date.now();

// 连接打开
ws.onopen = function() {
    const elapsed = Date.now() - connectionTime;
    console.log(`✅ 连接成功! 耗时: ${elapsed}ms`);
    
    // 发送测试消息
    setTimeout(() => {
        console.log('📤 发送测试消息...');
        ws.send(JSON.stringify({
            type: 'message',
            content: 'Hello from test script!'
        }));
    }, 1000);
    
    // 5秒后关闭连接
    setTimeout(() => {
        console.log('🔚 测试完成，关闭连接...');
        ws.close();
    }, 5000);
};

// 接收消息
ws.onmessage = function(event) {
    try {
        const data = JSON.parse(event.data);
        messageCount++;
        
        console.log(`📨 收到消息 #${messageCount}:`, {
            type: data.type,
            username: data.username || 'N/A',
            content: data.content || 'N/A',
            userCount: data.users ? data.users.length : 'N/A'
        });
        
        if (data.type === 'userList') {
            userListReceived = true;
            console.log('👥 用户列表:', data.users.map(u => u.username));
        }
        
    } catch (error) {
        console.error('❌ 解析消息失败:', error);
    }
};

// 连接关闭
ws.onclose = function(event) {
    console.log(`🔌 连接关闭:`, {
        code: event.code,
        reason: event.reason || '无原因',
        wasClean: event.wasClean
    });
    
    // 测试结果总结
    console.log('\n📊 测试结果总结:');
    console.log('- 连接状态:', event.wasClean ? '✅ 正常' : '❌ 异常');
    console.log('- 消息数量:', messageCount);
    console.log('- 用户列表:', userListReceived ? '✅ 已接收' : '❌ 未接收');
    
    if (event.wasClean && messageCount > 0 && userListReceived) {
        console.log('\n🎉 所有测试通过! WebSocket 连接正常工作。');
    } else {
        console.log('\n⚠️  测试未完全通过，请检查服务器状态。');
    }
};

// 连接错误
ws.onerror = function(error) {
    console.error('❌ WebSocket 错误:', error);
};

// 超时保护
setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
        console.error('⏰ 连接超时');
        ws.close();
    }
}, 10000);

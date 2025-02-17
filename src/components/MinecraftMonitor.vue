<template>
  <div class="minecraft-monitor">
    <nav class="navigation">
      <div
        class="nav-item"
        :class="{ active: currentView === 'dashboard' }"
        @click="setView('dashboard')"
      >
        实时监控
      </div>
      <div
        class="nav-item"
        :class="{ active: currentView === 'stats' }"
        @click="setView('stats')"
      >
        统计查询
      </div>
      <div
        class="nav-item"
        :class="{ active: currentView === 'chat' }"
        @click="setView('chat')"
      >
        聊天记录
      </div>
    </nav>

    <div v-if="currentView === 'dashboard'">
      <div
        class="connection-status"
        :class="{ 'status-connected': isConnected }"
      >
        {{ isConnected ? '已连接' : '未连接' }}
      </div>

      <div class="top-section">
        <div class="online-stats">
          <h3>在线情况</h3>
          <div class="stat-item">
            <span class="stat-label">总人数:</span>
            <span class="stat-value">{{ onlineStats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">游玩:</span>
            <span class="stat-value">{{ onlineStats.playing }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">队列:</span>
            <span class="stat-value">{{ onlineStats.queue }}</span>
          </div>
        </div>
        <div class="online-players">
          <h3>在线人员</h3>
          <div class="player-list">
            <div v-for="player in onlinePlayersList" :key="player" class="player-item">
              {{ player }}
            </div>
          </div>
        </div>
      </div>

      <div class="message-container">
        <h3>消息记录</h3>
        <div
          class="message-section"
          v-for="(messages, type) in groupedMessages"
          :key="type"
        >
          <h4>{{ getTypeTitle(type) }}</h4>
          <div class="message-list">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-item"
              :class="type"
            >
              <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
              <span class="content">{{ msg.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <stats-panel v-if="currentView === 'stats'" :stats="stats" />

    <div
      v-if="currentView === 'chat'"
      class="chat-panel"
      :key="chatPanelKey"
    >
      <h2>聊天记录</h2>

      <div class="chat-options">
        <label for="chat-days">选择天数:</label>
        <select id="chat-days" v-model="selectedDays" @change="fetchChatLog">
          <option value="1">1 天</option>
          <option value="3">3 天</option>
          <option value="7">7 天</option>
          <option value="30">30 天</option>
        </select>
      </div>

      <div class="chat-log" ref="chatLogContainer">
        <div
          v-for="(entry, index) in chatLogReversed"
          :key="index"
          class="chat-entry"
        >
          <span class="chat-timestamp">{{ formatDate(entry.timestamp) }}</span>
          <span class="chat-player">{{ entry.playerName }}:</span>
          <span class="chat-message">{{ entry.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatsPanel from './StatsPanel.vue';
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  computed,
} from 'vue';

export default {
  name: 'MinecraftMonitor',
  components: {
    StatsPanel,
  },
  setup() {
    const chatLog = ref([]);
    const selectedDays = ref(1);
    const socket = ref(null);
    const chatLogContainer = ref(null);

    const formatDate = (dateStr) => {
      if (!dateStr) return '未知';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    };

    const fetchChatLog = (days = selectedDays.value) => {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(
          JSON.stringify({ type: 'getChatLog', days: days })
        );
      } else {
        console.warn('WebSocket 连接未建立');
      }
    };

    onMounted(() => {
      socket.value = new WebSocket('wss://ck3c.xpdbk.com');

      socket.value.onopen = () => {
        console.log('WebSocket 连接已建立');
        fetchChatLog(); // 初始加载聊天记录
      };

      socket.value.onmessage = (event) => {
        try {
          const msgData = JSON.parse(event.data);

          if (msgData.type === 'chatLog') {
            // 接收到聊天记录后，不反转数组，直接赋值
            chatLog.value = msgData.data;
            // 触发 chatPanelKey 的更新
            chatPanelKey.value = Date.now();
          }

          // 首页消息记录的实时更新
          if (
            msgData.type === 'chat' ||
            msgData.type === 'death' ||
            msgData.type === 'join' ||
            msgData.type === 'leave' ||
            msgData.type === 'achievement' ||
            msgData.type === 'kill' ||
            msgData.type === 'system'
          ) {
            handleMessage(msgData);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      socket.value.onclose = () => {
        console.log('WebSocket 连接已关闭');
      };

      socket.value.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };
    });

    onBeforeUnmount(() => {
      if (socket.value) {
        socket.value.close();
      }
    });

    const chatLogReversed = computed(() => {
      // 使用计算属性返回反转后的聊天记录
      return [...chatLog.value].reverse();
    });

    // 用于强制重新渲染 chat-panel 的 key
    const chatPanelKey = ref(0);

    return {
      chatLog,
      selectedDays,
      formatDate,
      fetchChatLog,
      socket,
      chatLogContainer,
      chatLogReversed,
      chatPanelKey,
    };
  },
  data() {
    return {
      currentView: 'dashboard', // 默认选项卡
      messages: [],
      isConnected: false,
      ws: null,
      onlineStats: { total: 0, playing: 0, queue: 0 },
      onlinePlayersList: [],
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      stats: {},
      refreshInterval: null,
    };
  },
  computed: {
    groupedMessages() {
      return this.messages.reduce((groups, msg) => {
        if (!groups[msg.type]) {
          groups[msg.type] = [];
        }
        groups[msg.type].push(msg);
        return groups;
      }, {});
    },
    totalMessages() {
      return this.messages.length;
    },
  },
  methods: {
    setView(view) {
      this.currentView = view;
      localStorage.setItem('currentView', view); // 保存选项卡状态
    },
    connectWebSocket() {
      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket('wss://ck3c.xpdbk.com'); // 确保端口匹配

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        this.requestStats();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'tabUpdate') {
            this.updateOnlineStats(data.data);
            this.updateOnlinePlayers(data.data.onlinePlayerNames);
          } else if (data.type === 'stats') {
            this.updateStats(data.data);
          } else if (data.type && data.message) {
            this.handleMessage(data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    },
    requestStats() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'getStats' }));
      }
    },
    updateStats(stats) {
      this.stats = stats;
    },
    handleMessage(data) {
      const message = {
        type: data.type,
        content: data.message,
        timestamp: new Date(),
      };

      this.messages.unshift(message);

      if (this.messages.length > 1000) {
        this.messages = this.messages.slice(0, 1000);
      }
    },
    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          30000
        );
        setTimeout(() => {
          this.connectWebSocket();
        }, delay);
      }
    },
    formatTime(date) {
      return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    },
    getTypeTitle(type) {
      const titles = {
        chat: '聊天消息',
        death: '死亡消息',
        join: '加入游戏',
        leave: '离开游戏',
        achievement: '成就消息',
        kill: '击杀消息',
        system: '系统消息',
      };
      return titles[type] || type;
    },
    updateOnlineStats(data) {
      this.onlineStats = {
        total: data.onlinePlayers,
        playing: data.playingPlayers || data.onlinePlayers,
        queue: data.queuePlayers || 0,
      };
    },
    updateOnlinePlayers(playerList) {
      this.onlinePlayersList = Array.isArray(playerList) ? playerList : [];
    },
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 5000); // 5 秒
    },
    refreshData() {
        if (this.currentView === 'dashboard') {
            // 刷新仪表盘数据
            this.requestStats();
        } else if (this.currentView === 'stats') {
            // 刷新统计数据
            this.requestStats();
        } else if (this.currentView === 'chat') {
            // 刷新聊天记录
            this.fetchChatLog();
        }
    },
    stopAutoRefresh() {
      clearInterval(this.refreshInterval);
    },
  },
  mounted() {
    // 页面加载时，从 localStorage 获取上次访问的选项卡
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
      this.currentView = savedView;
    }

    this.connectWebSocket();
    this.startAutoRefresh();

    setInterval(() => {
      this.requestStats();
    }, 60000);
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close();
    }
    this.stopAutoRefresh(); // 清除定时器
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.minecraft-monitor {
  font-family: sans-serif;
  max-width: 1000px;
  margin: 20px auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.navigation {
  display: flex;
  background-color: #333;
  color: white;
}

.nav-item {
  padding: 15px 25px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #444;
}

.nav-item.active {
  background-color: #4caf50;
}

.connection-status {
  padding: 10px;
  text-align: center;
  background-color: #f44336;
  color: white;
  transition: background-color 0.3s;
}

.status-connected {
  background-color: #4caf50;
}

.top-section {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.online-stats,
.online-players {
  flex-basis: 48%;
}

.stat-item {
  margin-bottom: 10px;
}

.stat-label {
  font-weight: bold;
  margin-right: 5px;
}

.online-players .player-list {
  max-height: 200px;
  overflow-y: auto;
}

.player-item {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
}

.message-container {
  padding: 20px;
}

.message-section {
  margin-bottom: 20px;
}

.message-section h4 {
  margin-bottom: 10px;
  font-size: 1.2em;
  color: #333;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: #f9f9f9;
  border-left: 4px solid transparent;
}

.timestamp {
  font-size: 0.8em;
  color: #777;
  margin-right: 10px;
  white-space: nowrap;
}

/* Message type colors */
.chat {
  border-left-color: #2196f3;
}
.death {
  border-left-color: #f44336;
}
.join {
  border-left-color: #4caf50;
}
.leave {
  border-left-color: #ffc107;
}
.achievement {
  border-left-color: #9c27b0;
}
.kill {
  border-left-color: #e91e63;
}
.system {
  border-left-color: #607d8b;
}

/* Scrollbar styles */
.message-list::-webkit-scrollbar,
.player-list::-webkit-scrollbar,
.chat-log::-webkit-scrollbar {
  width: 8px;
}

.message-list::-webkit-scrollbar-track,
.player-list::-webkit-scrollbar-track,
.chat-log::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.message-list::-webkit-scrollbar-thumb,
.player-list::-webkit-scrollbar-thumb,
.chat-log::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.message-list::-webkit-scrollbar-thumb:hover,
.player-list::-webkit-scrollbar-thumb:hover,
.chat-log::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Chat Panel Styles */
.chat-panel {
  padding: 20px;
}

.chat-options {
  margin-bottom: 10px;
}

.chat-panel .chat-log {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px; /* Adjusted height */
  overflow-y: auto;
}

.chat-entry {
  margin-bottom: 5px;
  font-size: 14px;
}

.chat-timestamp {
  font-size: 12px;
  color: #888;
  margin-right: 5px;
}

.chat-player {
  font-weight: bold;
  margin-right: 5px;
}
</style>

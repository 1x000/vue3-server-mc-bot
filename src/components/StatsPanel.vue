<template>
  <div class="stats-panel">
    <h2>服务器统计数据</h2>
    
    <div class="stats-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-item', { active: currentTab === tab.id }]"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>
    
    <!-- 玩家活动统计 -->
    <div v-if="currentTab === 'players'" class="tab-content">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="playerSearch" 
          placeholder="搜索玩家..." 
          @input="filterPlayers"
        />
      </div>
      
      <div class="player-stats-grid">
        <div v-for="player in filteredPlayers" :key="player.name" class="player-stat-card">
          <h3>{{ player.name }}</h3>
          <div class="stat-detail">
            <span class="stat-label">在线时长:</span>
            <span class="stat-value">{{ formatOnlineTime(player.onlineTime) }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">首次上线:</span>
            <span class="stat-value">{{ formatDate(player.firstSeen) }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">最后上线:</span>
            <span class="stat-value">{{ formatDate(player.lastSeen) }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">发言次数:</span>
            <span class="stat-value">{{ player.chatCount }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">死亡次数:</span>
            <span class="stat-value">{{ player.deathCount }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">击杀次数:</span>
            <span class="stat-value">{{ player.killCount }}</span>
          </div>
          <div class="stat-detail">
            <span class="stat-label">被击杀次数:</span>
            <span class="stat-value">{{ player.victimCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 交互数据统计 -->
    <div v-if="currentTab === 'interactions'" class="tab-content">
      <div class="stat-section">
        <h3>聊天统计</h3>
        <div class="stat-detail">
          <span class="stat-label">总消息数:</span>
          <span class="stat-value">{{ stats.chat?.total || 0 }}</span>
        </div>
        <div class="stat-grid">
          <div v-for="(count, player) in topChatters" :key="player" class="stat-item">
            <span class="player-name">{{ player }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
      </div>
      
      <div class="stat-section">
        <h3>击杀统计</h3>
        <div class="stat-detail">
          <span class="stat-label">总击杀数:</span>
          <span class="stat-value">{{ stats.kill?.total || 0 }}</span>
        </div>
        <div class="stat-grid">
          <div v-for="(count, player) in topKillers" :key="player" class="stat-item">
            <span class="player-name">{{ player }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
      </div>
      
      <div class="stat-section">
        <h3>死亡统计</h3>
        <div class="stat-detail">
          <span class="stat-label">总死亡数:</span>
          <span class="stat-value">{{ stats.death?.total || 0 }}</span>
        </div>
        <h4>按玩家</h4>
        <div class="stat-grid">
          <div v-for="(count, player) in topDeaths" :key="player" class="stat-item">
            <span class="player-name">{{ player }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
        <h4>按死亡原因</h4>
        <div class="stat-grid">
          <div v-for="(count, reason) in stats.death?.byReason" :key="reason" class="stat-item">
            <span class="player-name">{{ formatDeathReason(reason) }}</span>
            <span class="count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 成就统计 -->
    <div v-if="currentTab === 'achievements'" class="tab-content">
      <div class="stat-detail">
        <span class="stat-label">总成就解锁数:</span>
        <span class="stat-value">{{ stats.achievement?.total || 0 }}</span>
      </div>
      
      <h3>按玩家</h3>
      <div class="stat-grid">
        <div v-for="(count, player) in stats.achievement?.byPlayer" :key="player" class="stat-item">
          <span class="player-name">{{ player }}</span>
          <span class="count">{{ count }}</span>
        </div>
      </div>
      
      <h3>按成就类型</h3>
      <div class="stat-grid">
        <div v-for="(count, type) in stats.achievement?.byType" :key="type" class="stat-item">
          <span class="player-name">{{ type }}</span>
          <span class="count">{{ count }}</span>
        </div>
      </div>
    </div>
    
    <!-- 服务器概况 -->
    <div v-if="currentTab === 'overview'" class="tab-content">
      <div class="stat-section">
        <h3>活动统计</h3>
        <div class="stat-detail">
          <span class="stat-label">总加入次数:</span>
          <span class="stat-value">{{ stats.join?.total || 0 }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">总离开次数:</span>
          <span class="stat-value">{{ stats.leave?.total || 0 }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">总聊天消息:</span>
          <span class="stat-value">{{ stats.chat?.total || 0 }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">总死亡次数:</span>
          <span class="stat-value">{{ stats.death?.total || 0 }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">总击杀次数:</span>
          <span class="stat-value">{{ stats.kill?.total || 0 }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">总成就解锁:</span>
          <span class="stat-value">{{ stats.achievement?.total || 0 }}</span>
        </div>
      </div>
      
      <div class="stat-section">
        <h3>玩家记录</h3>
        <div class="stat-detail">
          <span class="stat-label">总计玩家数:</span>
          <span class="stat-value">{{ Object.keys(stats.firstSeen || {}).length }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">最老玩家:</span>
          <span class="stat-value">{{ oldestPlayer }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">最新玩家:</span>
          <span class="stat-value">{{ newestPlayer }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-label">在线时间最长:</span>
          <span class="stat-value">{{ topOnlinePlayer }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsPanel',
  props: {
    stats: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentTab: 'overview',
      tabs: [
        { id: 'overview', label: '服务器概况' },
        { id: 'players', label: '玩家统计' },
        { id: 'interactions', label: '交互数据' },
        { id: 'achievements', label: '成就统计' }
      ],
      playerSearch: '',
      filteredPlayers: []
    };
  },
  computed: {
    // 获取聊天排行前10的玩家
    topChatters() {
      return this.getTopEntries(this.stats.chat?.byPlayer || {}, 10);
    },
    // 获取击杀排行前10的玩家
    topKillers() {
      return this.getTopEntries(this.stats.kill?.byPlayer || {}, 10);
    },
    // 获取死亡排行前10的玩家
    topDeaths() {
      return this.getTopEntries(this.stats.death?.byPlayer || {}, 10);
    },
    // 获取最早加入的玩家
    oldestPlayer() {
      const firstSeen = this.stats.firstSeen || {};
      let oldest = { player: '无数据', time: Date.now() };
      
      for (const [player, timeStr] of Object.entries(firstSeen)) {
        const time = new Date(timeStr).getTime();
        if (time < oldest.time) {
          oldest = { player, time };
        }
      }
      
      return oldest.player !== '无数据' ? 
        `${oldest.player} (${this.formatDate(new Date(oldest.time))})` : 
        '无数据';
    },
    // 获取最新加入的玩家
    newestPlayer() {
      const firstSeen = this.stats.firstSeen || {};
      let newest = { player: '无数据', time: 0 };
      
      for (const [player, timeStr] of Object.entries(firstSeen)) {
        const time = new Date(timeStr).getTime();
        if (time > newest.time) {
          newest = { player, time };
        }
      }
      
      return newest.player !== '无数据' ? 
        `${newest.player} (${this.formatDate(new Date(newest.time))})` : 
        '无数据';
    },
    // 获取在线时间最长的玩家
    topOnlinePlayer() {
      const onlineTime = this.stats.onlineTime?.byPlayer || {};
      let top = { player: '无数据', time: 0 };
      
      for (const [player, time] of Object.entries(onlineTime)) {
        if (time > top.time) {
          top = { player, time };
        }
      }
      
      return top.player !== '无数据' ? 
        `${top.player} (${this.formatOnlineTime(top.time)})` : 
        '无数据';
    }
  },
  methods: {
    getTopEntries(obj, limit = 10) {
      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '未知';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    formatOnlineTime(ms) {
      if (!ms) return '0分钟';
      
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days}天${hours % 24}小时`;
      } else if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    
    formatDeathReason(reason) {
      const reasonMap = {
        'fall_damage': '坠落伤害',
        'fire': '火焰伤害',
        'lava': '岩浆',
        'explosion': '爆炸',
        'magic': '魔法伤害',
        'drowning': '溺水',
        'starvation': '饥饿',
        'suffocation': '窒息',
        'unknown': '未知原因'
      };
      
      return reasonMap[reason] || reason;
    },
    
    filterPlayers() {
      // 构建玩家列表
      const playerList = [];
      const search = this.playerSearch.toLowerCase();
      
      // 获取所有出现过的玩家名称
      const allPlayerNames = new Set([
        ...Object.keys(this.stats.firstSeen || {}),
        ...Object.keys(this.stats.onlineTime?.byPlayer || {}),
        ...Object.keys(this.stats.chat?.byPlayer || {}),
        ...Object.keys(this.stats.death?.byPlayer || {}),
        ...Object.keys(this.stats.kill?.byPlayer || {})
      ]);
      
      for (const name of allPlayerNames) {
        if (search && !name.toLowerCase().includes(search)) {
          continue;
        }
        
        playerList.push({
          name,
          onlineTime: this.stats.onlineTime?.byPlayer[name] || 0,
          firstSeen: this.stats.firstSeen?.[name],
          lastSeen: this.stats.lastSeen?.[name],
          chatCount: this.stats.chat?.byPlayer[name] || 0,
          deathCount: this.stats.death?.byPlayer[name] || 0,
          killCount: this.stats.kill?.byPlayer[name] || 0,
          victimCount: this.stats.kill?.victims?.[name] || 0
        });
      }
      
      // 排序：按在线时间降序
      this.filteredPlayers = playerList.sort((a, b) => b.onlineTime - a.onlineTime);
    }
  },
  watch: {
    stats: {
      handler() {
        this.filterPlayers();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
.stats-panel {
  padding: 20px;
}

.stats-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-item.active {
  border-bottom-color: #4CAF50;
  font-weight: bold;
}

.tab-content {
  margin-top: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.player-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.player-stat-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.player-stat-card h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.stat-section {
  margin-bottom: 30px;
}

.stat-section h3 {
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.stat-detail {
  display: flex;
  margin-bottom: 8px;
}

.stat-label {
  font-weight: bold;
  min-width: 120px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
}

.player-name {
  font-weight: 500;
}

.count {
  font-weight: bold;
  color: #4CAF50;
}
</style>

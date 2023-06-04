<script setup lang="ts">
import IconoirCheckCircle from '~icons/iconoir/check-circle'
import IconoirAlarm from '~icons/iconoir/alarm'
</script>

<template>
  <el-container>
    <el-aside width="65px" class="sidebar my2">
      <el-menu mode="vertical" class="my-2 side-menu" collapse router :default-active="$route.path">
        <el-menu-item class="menu-logo">
          <img src="./assets/icon.png" />
        </el-menu-item>
        <el-divider direction="horizontal" class="logo-divider" />
        <el-menu-item index="/timesheet">
          <iconoir-alarm />
        </el-menu-item>
        <el-menu-item index="/todo">
          <iconoir-check-circle />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view v-slot="{ Component, route }">
          <transition name="falde">
            <div :key="route.path">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="less">
@import './assets/css/styles.less';

.el-input-number {
  width: 100% !important;
}

.el-table__footer .cell {
  //text-align: center !important;
  font-weight: bold;
}

.side-menu {
  border-radius: 4px !important;
}

.sidebar {
  padding: 20px 0;
}

.fade-enter-active,
.fade--leave-active {
  transition: all 0.3s ease;
}

.fade--leave-from,
.fade--enter-to {
  opacity: 1;
  position: relative;
  z-index: 1;
}

.fade--leave-to,
.fade--enter-from {
  opacity: 0;
  position: absolute;
  z-index: 0;
}

.menu-logo {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  img {
    width: 28px;
  }
}

.logo-divider {
  margin: 0;
}
</style>

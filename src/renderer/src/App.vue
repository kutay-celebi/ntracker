<script setup lang="ts">
import IconoirCheckCircle from '~icons/iconoir/check-circle'
import IconoirAlarm from '~icons/iconoir/alarm'
</script>

<template>
  <el-container>
    <el-aside width="65px" class="sidebar my2">
      <el-menu mode="vertical" class="my-2 side-menu" collapse router>
        <el-menu-item :route="{ path: '/timesheet' }" index="timesheet">
          <iconoir-alarm />
        </el-menu-item>
        <el-menu-item :route="{ path: '/todo' }" index="todo">
          <iconoir-check-circle />
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view />
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
</style>

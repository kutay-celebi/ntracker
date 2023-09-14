<script setup lang="ts">
import { computed, PropType, ref, toRaw, watch } from 'vue'
import { EntryDO, EntryOverviewDO } from '@main/db/types/Entry'
import MarkdownRenderer from '@renderer/components/MarkdownRenderer.vue'
import RiSave3Line from '~icons/ri/save-3-line'
import RiEditBoxLine from '~icons/ri/edit-box-line'
import RiCloseCircleLine from '~icons/ri/close-circle-line'

const props = defineProps({
  modelValue: {
    type: null as unknown as PropType<EntryDO | undefined>
  }
})
const emits = defineEmits(['update:modelValue', 'save'])

const initialModel = ref()
const innerModelValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emits('update:modelValue', val)
  }
})

const isEdit = ref(false)
const entryOverview = ref<EntryOverviewDO>()
const title = computed(() => {
  return props.modelValue ? props.modelValue.label : 'Overview'
})

watch(
  () => props.modelValue,
  (val) => {
    initialModel.value = { ...toRaw(val) }
    prepareOverview()
  }
)

const prepareOverview = async () => {
  if (props.modelValue && props.modelValue.id) {
    await window.api.getEntryOverview(props.modelValue.id).then((value) => {
      entryOverview.value = value
    })
  } else {
    entryOverview.value = undefined
  }
}

const toggleEdit = () => {
  if (isEdit.value) {
    innerModelValue.value = { ...toRaw(initialModel.value) }
  }

  isEdit.value = !isEdit.value
}

const saveEntry = () => {
  emits('save')
  isEdit.value = !isEdit.value
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="overview-header">
        <span>{{ title }}</span>
        <div v-if="entryOverview">
          <el-button v-if="isEdit" type="success" circle title="Save" @click="saveEntry"> <ri-save3-line /> </el-button>
          <el-button :type="isEdit ? 'danger' : 'primary'" circle @click="toggleEdit">
            <ri-edit-box-line v-if="!isEdit" />
            <ri-close-circle-line v-else />
          </el-button>
        </div>
      </div>
    </template>
    <div v-if="entryOverview && !isEdit">
      <table class="overview-table">
        <tr>
          <td>Estimation</td>
          <td>{{ entryOverview.estimation }}</td>
        </tr>
        <tr>
          <td class="overview-item-label">Total Time Spent</td>
          <td>
            {{ entryOverview.spent }}
          </td>
        </tr>
        <tr>
          <td>Notes</td>
          <td>
            <markdown-renderer v-if="entryOverview.notes" :markdown="entryOverview.notes" />
          </td>
        </tr>
      </table>
    </div>
    <el-form v-if="innerModelValue && isEdit" label-width="100px">
      <el-form-item label="Label">
        <el-input v-model="innerModelValue.label" readonly disabled></el-input>
      </el-form-item>
      <el-form-item label="Estimation">
        <el-input-number v-model="innerModelValue.estimation" :min="0" :controls="false"></el-input-number>
      </el-form-item>
      <el-form-item label="Notes">
        <el-input v-model="innerModelValue.notes" type="textarea" autosize class="notes-input"></el-input>
      </el-form-item>
    </el-form>
    <el-alert v-if="!entryOverview" show-icon type="info" :closable="false" effect="dark"> Select row first. </el-alert>
  </el-card>
</template>

<style scoped lang="less">
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.overview-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  td {
    padding: 0.5rem;
    border: var(--el-border);
  }

  tr {
    td:first-child {
      background: var(--el-fill-color);
      width: 20%;
    }
  }
}

.overview-item-label {
  white-space: nowrap;
}
</style>

<template>
  <el-card shadow="never" class="renderer">
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <div v-html="renderedMarkdown"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, PropType } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps({
  markdown: {
    type: null as unknown as PropType<string | undefined>,
    required: true
  }
})

const renderedMarkdown = ref('')

watch(() => props.markdown, renderMarkdown, { immediate: true })

function renderMarkdown() {
  const md = new MarkdownIt({
    html: true,
    highlight: (code, language) => {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
      const highlightedCode = hljs.highlight(validLanguage, code).value
      return `<pre class="hljs"><code class="language-${validLanguage}">${highlightedCode}</code></pre>`
    }
  })

  renderedMarkdown.value = md.render(props.markdown ? props.markdown : 'No data')
}
</script>

<style scoped lang="less">
@import 'highlight.js/styles/default.css';
</style>

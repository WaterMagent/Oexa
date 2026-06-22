<script lang="ts">
	let { currentPage, totalPages }: { currentPage: number; totalPages: number } = $props();
	let { onPrev, onNext }: { onPrev?: () => void; onNext?: () => void } = $props();
</script>

<div class="pagination">
	<mdui-button variant="text" disabled={currentPage === 1} onclick={onPrev}>上一页</mdui-button>
	<span>第 {currentPage} / {totalPages} 页</span>
	<mdui-button variant="text" disabled={currentPage === totalPages} onclick={onNext}>下一页</mdui-button>
</div>

<style>
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}
</style>

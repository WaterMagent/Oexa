<script lang="ts">
	import { getSystemInfo } from '$lib/utils/widget';

	let info = $state(getSystemInfo());
	let dashOffset = $state(0);
	const circumference = 2 * Math.PI * 52;

	function updateClock() {
		info = getSystemInfo();
		const now = new Date();
		const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
		dashOffset = circumference - (seconds / 60) * circumference;
	}

	$effect(() => {
		updateClock();
		const id = setInterval(updateClock, 100);
		return () => clearInterval(id);
	});
</script>

<mdui-card class="clock-card">
	<div class="clock-face">
		<div class="digital-time">
			<span class="time">{info.time}</span>
			<span class="date">{info.date}</span>
		</div>

		<svg class="progress-ring" width="120" height="120">
			<circle
				class="progress-ring__circle"
				stroke="#bb86fc"
				stroke-width="4"
				fill="transparent"
				r="52"
				cx="60"
				cy="60"
				stroke-dasharray={circumference}
				stroke-dashoffset={dashOffset}
			/>
		</svg>
	</div>
</mdui-card>

<style>
	.clock-card {
		padding: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: transparent;
	}

	.clock-face {
		position: relative;
		width: 120px;
		height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.digital-time {
		position: absolute;
		text-align: center;
		z-index: 1;
	}

	.time {
		display: block;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.date {
		display: block;
		font-size: 0.7rem;
		color: var(--text-secondary);
		margin-top: 4px;
	}

	.progress-ring__circle {
		transition: stroke-dashoffset 0.1s linear;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
	}
</style>

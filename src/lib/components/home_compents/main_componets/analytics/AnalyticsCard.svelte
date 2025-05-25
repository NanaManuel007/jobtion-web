<script>
	import { jobs } from '$lib/services/job_services/job.store';
	import { clients } from '$lib/services/client_services/client.store';
	import AnalyticsChartComponent from './AnalyticsChartComponent.svelte';
	import { jobActions } from '$lib/services/job_services/job.store';
	import { clientActions } from '$lib/services/client_services/client.store';
	import { candidateStore } from '$lib/services/candidate_services/candidate.store';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let activeJobCount = $state(0);
	let inactiveJobCount = $state(0);
	let totalJobs = $state(0);
	let jobPercentage = $state(0);

	let activeClientCount = $state(0);
	let inactiveClientCount = $state(0);
	let totalClients = $state(0);
	let clientPercentage = $state(0);

	let verifiedCount = $state(0);
	let totalCandidates = $state(0);
	let verificationPercentage = $state(0);

	// First effect to load all data
	$effect(() => {
		if (!mounted) {
			jobActions.getAllJobsWithoutClientId();
			clientActions.fetchClients();
			candidateStore.fetchCandidates();
			mounted = true;
		}
	});
	$effect(() => {
	totalCandidates = $candidateStore.candidates.length;
	verifiedCount = $candidateStore.candidates.filter(
		(candidate) => candidate.adminVerification === 1
	).length;

	const total = totalCandidates;
	verificationPercentage = total === 0 ? 0 : Number(((verifiedCount / total) * 100).toFixed(0));
});

	// Effect to handle jobs updates
	$effect(() => {
		totalJobs = $jobs.length;
		activeJobCount = $jobs.filter((job) => job.applications?.length > 0).length;
		inactiveJobCount = $jobs.filter((job) => !job.applications?.length).length;

		const total = activeJobCount + inactiveJobCount;
		jobPercentage = total === 0 ? 0 : Number(((activeJobCount / total) * 100).toFixed(0));
	});

	// Effect to handle clients updates
	$effect(() => {
		totalClients = $clients.length;
		activeClientCount = $clients.filter((client) => client.total_jobs_posted).length;
		inactiveClientCount = totalClients - activeClientCount;

		const total = activeClientCount + inactiveClientCount;
		clientPercentage = total === 0 ? 0 : Number(((activeClientCount / total) * 100).toFixed(0));
	});
</script>

<h2 class="pt-10 text-lg font-semibold">Analytics</h2>

<div class="min-w- grid grid-cols-3 gap-6 pb-6 sm:grid-cols-1 md:grid-cols-3">
	<div
		class="flex items-center justify-between rounded-2xl bg-white p-6
                shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300 xl:grid-cols-1 xl:gap-0"
	>
		<div>
			<h3 class="text-sm font-medium text-gray-600">Active Jobs</h3>
			<p class="text-2xl font-bold">{activeJobCount} / {totalJobs}</p>
		</div>
		<AnalyticsChartComponent percentage={jobPercentage} color={'#4CAF50'} />
	</div>

	<div
		class="flex items-center justify-between rounded-2xl bg-white p-6
                shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300 xl:grid-cols-1 xl:gap-0"
	>
		<div>
			<h3 class="text-sm font-medium text-gray-600">Active Clients</h3>
			<p class="text-2xl font-bold">{activeClientCount} / {totalClients}</p>
		</div>
		<AnalyticsChartComponent percentage={clientPercentage} color={'#2196F3'} />
	</div>

	<div
		class="flex items-center justify-between rounded-2xl bg-white p-6
    shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300 xl:grid-cols-1 xl:gap-0"
	>
		<div>
			<h3 class="text-sm font-medium text-gray-600">Verified Candidates</h3>
			<p class="text-2xl font-bold">{verifiedCount} / {totalCandidates}</p>
		</div>
		<AnalyticsChartComponent percentage={verificationPercentage} color={'#FF9800'} />
	</div>
</div>

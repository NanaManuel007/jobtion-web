<script lang="ts">
    import { fly } from 'svelte/transition';
    import type { Candidate, CandidateQualification, CandidateReference, CandidateOtherDocument } from '$lib/services/candidate_services/candidate.type';

    import JSZip from 'jszip';
    import pkg from 'file-saver';
    const {saveAs} = pkg;
    export let candidate: Candidate;
    export let qualifications: CandidateQualification[];
    export let references: CandidateReference[];
    export let otherDocuments: CandidateOtherDocument[];
    type Document = {
        type: string;
        status: 'Verified' | 'Pending';
        icon: string;
        date: string;
        isImage: boolean;
        isPdf?: boolean;
        url?: string;
    };
    let showPreview = false;
    let selectedDoc: Document | null = null;
    async function handleDownloadAll() {
        const zip = new JSZip();
        const candidateName = `${candidate?.firstName+candidate?.lastName}_${candidate.phoneNumber}`.toLowerCase();

        for (const doc of documents) {
            if (doc.url) {
                try {
                    const response = await fetch(doc.url);
                    const blob = await response.blob();
                    const extension = doc.isPdf ? '.pdf' : '.jpg';
                    const fileName = `${doc.type.toLowerCase().replace(/\s+/g, '_')}${extension}`;
                    zip.file(fileName, blob);
                } catch (error) {
                    console.error(`Error downloading ${doc.type}:`, error);
                }
            }
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${candidateName}_documents.zip`);
        } catch (error) {
            console.error('Error creating zip:', error);
        }
    }
    console.log(qualifications.length > 0 ? qualifications:"null")
    const documents: Document[] = [
        { type: 'CV/Resume', status: 'Verified', icon: 'description', date: '2023-10-15', isImage: false, isPdf: true, url: candidate.resumeCv ? `https://node.jobtiondevs.com/${candidate.resumeCv}` : '/path/to/default.pdf' },
        // { type: 'DBS Certificate', status: 'Pending', icon: 'verified_user', date: '2023-10-14', isImage: false, isPdf: true, url: candidate.dbsCertificate ? `https://node.jobtiondevs.com/${candidate.dbsCertificate}` : '/path/to/default.pdf' },
        { type: 'Qualifications', status: 'Verified', icon: 'school', date: '2023-10-13', isImage: false, isPdf: true, url: qualifications.length > 0 ? (qualifications[0].upload_doc ? `https://node.jobtiondevs.com/${qualifications[0].upload_doc}` : '/path/to/quals.pdf') : undefined },
        { type: 'National ID', status: 'Verified', icon: 'badge', date: '2023-10-12', isImage: true, url: candidate.nationalIdentity ? `https://node.jobtiondevs.com/${candidate.nationalIdentity}` : '/path/to/default.jpg' },
        { type: 'Right to Work UK', status: 'Pending', icon: 'work', date: '2023-10-11', isImage: false, isPdf: true, url: candidate.rightToWorkDoc ? `https://node.jobtiondevs.com/${candidate.rightToWorkDoc}` : '/path/to/default.pdf' },
        { type: 'Identification Picture', status: 'Verified', icon: 'photo_camera', date: '2023-10-10', isImage: true, url: candidate.identification ? `https://node.jobtiondevs.com/${candidate.identification}` : '/path/to/default.jpg' },
        { type: 'Proof of Address', status: 'Verified', icon: 'home', date: '2023-10-09', isImage: true, url: candidate.proofOfAddress ? `https://node.jobtiondevs.com/${candidate.proofOfAddress}` : '/path/to/default.jpg' }
    ];

    function handleEdit(docType: string) {
        console.log('Editing document:', docType);
    }

    function handlePreview(doc: Document) {
        selectedDoc = doc;
        showPreview = true;
    }

    function handleViewPdf(url: string) {
        window.open(url, '_blank');
    }
</script>

<div 
    class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] p-8"
    in:fly={{ x: 100, duration: 800, delay: 300 }}
>
    <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
            <span class="material-icons-sharp text-gray-600 text-4xl">folder</span>
        </div>
        <div>
            <h3 class="text-3xl font-bold text-gray-800 mb-2">Documents</h3>
            <p class="text-gray-600 flex items-center gap-2">
                <span class="material-icons-sharp text-sm">info</span>
                Required verification documents
            </p>
        </div>
        <div class="ml-auto flex gap-2">
            <button 
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                on:click={handleDownloadAll}
            >
                <span class="material-icons-sharp text-sm">download</span>
                Download All
            </button>
            <button class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                <span class="material-icons-sharp text-sm">upload_file</span>
                Upload New
            </button>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
        <!-- Essential Documents -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 400 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Essential Documents</h4>
            <div class="space-y-4">
                {#each documents.slice(0, 3) as doc}
                    <div class="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span class="material-icons-sharp text-gray-600">{doc.icon}</span>
                        </div>
                        <div class="flex-grow">
                            <h5 class="font-medium text-gray-900">{doc.type}</h5>
                            <p class="text-sm text-gray-500">Uploaded on {new Date(doc.date).toLocaleDateString()}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-full text-sm font-medium 
                                {doc.status === 'Verified' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}">
                                {doc.status}
                            </span>
                            {#if doc.isPdf}
                                <button 
                                    class="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    on:click={() => {if(doc.url) handleViewPdf(doc.url)}}
                                >
                                    <span class="material-icons-sharp text-gray-600">picture_as_pdf</span>
                                </button>
                            {/if}
                            {#if doc.isImage}
                                <button 
                                    class="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    on:click={() => handlePreview(doc)}
                                >
                                    <span class="material-icons-sharp text-gray-600">visibility</span>
                                </button>
                            {/if}
                            <button class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <span class="material-icons-sharp text-gray-600">edit</span>
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Identity Documents -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 500 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Identity Documents</h4>
            <div class="space-y-4">
                {#each documents.slice(3, 7) as doc}
                    <div class="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span class="material-icons-sharp text-gray-600">{doc.icon}</span>
                        </div>
                        <div class="flex-grow">
                            <h5 class="font-medium text-gray-900">{doc.type}</h5>
                            <p class="text-sm text-gray-500">Uploaded on {new Date(doc.date).toLocaleDateString()}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-full text-sm font-medium 
                                {doc.status === 'Verified' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}">
                                {doc.status}
                            </span>
                            {#if doc.isPdf}
                                <button 
                                    class="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    on:click={() => {
                                        if (doc.url) handleViewPdf(doc.url);
                                    }}
                                >
                                    <span class="material-icons-sharp text-gray-600">picture_as_pdf</span>
                                </button>
                            {/if}
                            {#if doc.isImage}
                                <button 
                                    class="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    on:click={() => handlePreview(doc)}
                                >
                                    <span class="material-icons-sharp text-gray-600">visibility</span>
                                </button>
                            {/if}
                            <button class="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <span class="material-icons-sharp text-gray-600">edit</span>
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>


{#if showPreview && selectedDoc}
    <div
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label="Document Preview"
        on:keydown={(e) => {
            if (e.key === 'Escape') showPreview = false;
        }}
        class="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
        on:click={() => showPreview = false}
    >
        <div
            role="dialog"
            tabindex="0"
            on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === 'Space') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
            class="bg-white p-4 rounded-xl max-w-2xl w-full mx-4 shadow-lg"
            on:click|stopPropagation
        >
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-800">{selectedDoc.type}</h3>
                <button 
                    class="p-2 hover:bg-gray-100 rounded-full"
                    on:click={() => showPreview = false}
                >
                    <span class="material-icons-sharp">close</span>
                </button>
            </div>
            <div class="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                    src={selectedDoc.url} 
                    alt={selectedDoc.type}
                    class="w-full h-full object-contain"
                />
            </div>
            <div class="mt-4 flex justify-end gap-2">
                <button 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    on:click={() => showPreview = false}
                >
                    <span class="material-icons-sharp mr-1">close</span>
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
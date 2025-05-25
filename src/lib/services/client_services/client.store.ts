import { writable, get } from 'svelte/store';
import type {AppliedCandidate, ClientsType, SelectedClientType} from '$lib/services/client_services/client.type';
import { ClientService } from '$lib/services/client_services/client.services';


export const clients = writable<ClientsType[]>([]);
export const allClients = writable<ClientsType[]>([]); 
export const totalClients = writable<number>(0);
export const currentPage = writable<number>(1);
export const isLoading = writable<boolean>(false);
export const selectedClient = writable<SelectedClientType | null>(null);
export const loadingData =writable<boolean>(false);
// export const getApplicantById = async (candidateId: number): Promise<AppliedCandidate | null> => {
//     isLoading.set(true);
//     try {
//         const client = get(selectedClient);
//         if (!client || !client.applied_candidates) {
//             return null;
//         }
        
//         const candidate = client.applied_candidates.find(c => c.candidate_id === candidateId);
//         return candidate || null;
//     } catch (error) {
//         console.error('Error in getApplicantById:', error);
//         return null;
//     } finally {
//         isLoading.set(false);
//     }
// };
export const clientActions = {
    // async fetchClients(page: number = 1, limit: number = 10) {
    //     isLoading.set(true);
    //     try {
    //         const result = await ClientService.getAllClients();
            
    //         // Store all clients in memory for client-side pagination and lookup
    //         const allClientsData = [...result];
    //         allClients.set(allClientsData);
            
    //         // Calculate total for pagination
    //         totalClients.set(allClientsData.length);
            
    //         // Apply pagination client-side
    //         const startIndex = (page - 1) * limit;
    //         const endIndex = startIndex + limit;
    //         const paginatedClients = allClientsData.slice(startIndex, endIndex);
            
    //         clients.set(paginatedClients);
    //         currentPage.set(page);
    //     } catch (error) {
    //         console.error('Error in fetchClients:', error);
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },

    // async fetchClients() {
    //     if (get(isLoading)) return; // Prevent multiple simultaneous requests
        
    //     isLoading.set(true);
    //     try {
    //         const result = await ClientService.getAllClients();
    //         if (result) {  // Check if result exists
    //             clients.set(result);
    //             allClients.set(result);
    //             totalClients.set(result.length);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching clients:', error);
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },

    async fetchClients() {
        if (get(isLoading)) return;
        
        isLoading.set(true);
        try {
            const result = await ClientService.getAllClients();
            if (result) {
                clients.set(result);
                allClients.set(result);
                totalClients.set(result.length);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            isLoading.set(false);
        }
    },
    async getApplicantById(candidateId: number): Promise<AppliedCandidate | null> {
        isLoading.set(true);
        try {
            const client = get(selectedClient);
            if (!client?.data?.applied_candidates) {
                console.log('No client data or applied candidates available');
                return null;
            }
            const candidate = client.data.applied_candidates.find(c => c.candidate_id === candidateId);
            return candidate || null;
        } catch (error) {
            console.error('Error in getApplicantById:', error);
            return null;
        } finally {
            isLoading.set(false);
        }
    },
    // async getClientById(id: number) {
    //     isLoading.set(true);
    //     try {
    //         // First check if we already have the client in our store
    //         const allClientsData = get(allClients);
    //         let client = allClientsData.find(c => c.id === id);
            
    //         // If not found in store, try to fetch from API
    //         if (!client) {
    //             // If there's no endpoint, fetch all clients and then find the one we need
    //             if (allClientsData.length === 0) {
    //                 await this.fetchClients(); // Fetch with larger limit to increase chances of finding the client
    //                 const refreshedClients = get(allClients);
    //                 client = refreshedClients.find(c => c.id === id);
    //             }
    //         }
            
    //         selectedClient.set(client || null);
    //         return client || null;
    //     } catch (error) {
    //         console.error('Error in getClientById:', error);
    //         return null;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },
    
    // async approveClient(id: number) {
    //     isLoading.set(true);
    //     try {
    //         const success = await ClientService.approveClient(id);
    //         if (success) {
    //             // Refresh the client list after approval
    //             await this.fetchClients(currentPage.get());
    //         }
    //         return success;
    //     } catch (error) {
    //         console.error('Error in approveClient:', error);
    //         return false;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // }

    async getClientById(id: number) {
        isLoading.set(true);
        try {
            const client = await ClientService.getClientById(id);
    
            selectedClient.set(client || null);
            console.log("client store",client)
            return client;
        } catch (error) {
            console.error('Error in getClientById:', error);
            selectedClient.set(null);
            return null;
        } finally {
            isLoading.set(false);
        }
    },

    async getClientByIdLoad(id: number) {
        loadingData.set(true);
        try {
            const client = await ClientService.getClientById(id);
    
            selectedClient.set(client || null);
            loadingData.set(false);

            // console.log("client store",client)
            return client;
        } catch (error) {
            console.error('Error in getClientById:', error);
            // selectedClient.set(null);
            return null;
        } finally {
            loadingData.set(false);
        }
    },
};

// getApplicant by id
let newValue:number;
async function hello (){
let value1 = 1;
for(value1;value1<10;value1++){
    if(value1==9){
        newValue=value1;
    }
    console.log(newValue)
}
}

// let availableSchedule = {
// day: "Monday",
// start_time: "10:00",
// end_time: "18:00",
// schedle:"Morning | Afternoon | Before School",// abi you barb,
// job: "company",
// role:"Teacher"
// }
// show current, booked, completed, applied and available schedule,
// book user right there on user profile
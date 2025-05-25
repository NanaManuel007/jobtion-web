export interface AnalyticsData{
    title:string;
    value: string;
    percentage:number;
    color:string;
}

export const analysticsData :AnalyticsData[]=[
    { title: "Total Jobs Completed", value: "$65,024", percentage: 90, color: "#4CAF50" },
    { title: "Unpaid Jobs", value: "24,981", percentage: -48, color: "#F44336" },
    { title: "Current Pending Jobs", value: "14,147", percentage: 21, color: "#2196F3" }
]
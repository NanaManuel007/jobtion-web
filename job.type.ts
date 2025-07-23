export type DayTimesheet = {
    workDate: string;
    start: string;
    finish: string;
    break: string;
    expense: number;
    miles: number;
    rating: number;
    notes: string;
    longitude: number;
    latitude: number;
    status?: string; // Add optional status property
};
// When given a userid, eventtype and date range give record of events that user did
interface AuditTrailEntry {
    name_of_user: string;
    username: string;
    ip: string;
    date_of_event: string;
    description: string;
    item?: string;
}

export default function getAuditTrail(userid: number, eventtype: string, fromDate: Date, toDate: Date): Promise<AuditTrailEntry[]> {
    return new Promise((res, rej) => {
        
    });
}
import type { ServiceEvent, ServiceEventDetail, ServiceQuery, ServiceAudit } from "~/models/service";
import { request } from "./request";

export const getServiceEventList: (query?: ServiceQuery) => Promise<ServiceEvent[]> = async (query) => {
    const res = request("/api/service/", "get", query, true);
    return res as unknown as ServiceEvent[];
}

export const getServiceEventCount: (query?: ServiceQuery) => Promise<number> = async (query) => {
    const res = request("/api/service/count", "get", query, true);
    return res as unknown as number;
}

export const getServiceEventDetail: (serviceid: number) => Promise<ServiceEventDetail> = async (serviceid) => {
    const res = request("/api/service/detail", "get", { id: serviceid }, true);
    return res as unknown as ServiceEventDetail;
}

export const auditServiceEvent: (audit: ServiceAudit) => Promise<string> = async (audit) => {
    const res = request("/api/service/audit", "put", audit);
    return res as unknown as string;
}
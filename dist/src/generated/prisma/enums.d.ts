export declare const LeadStatus: {
    readonly APPROVED: "APPROVED";
    readonly PENDING: "PENDING";
    readonly REJECTED: "REJECTED";
};
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly COLLABORATOR: "COLLABORATOR";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

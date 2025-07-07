// Issue interface for consistent reporting
export interface Issue {
    file: string;
    line: number;
    column?: number;
    type: "error" | "warning" | "info";
    category: string;
    message: string;
    ruleId?: string;
    severity: number;
    context?: string;
    suggestion?: string;
}

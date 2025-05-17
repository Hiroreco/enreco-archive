import { cn } from "@enreco-archive/common-ui/lib/utils";
import "@enreco-archive/common-ui/components/Stack.css";

interface StackProps {
    className?: string;
    children?: React.ReactNode;
}

interface StackItemProps {
    className?: string;
    children?: React.ReactNode;
}

export function StackItem({ className, children }: StackItemProps) {
    return <div className={cn("stack-item", className)}>{children}</div>;
}

export function Stack({ className, children }: StackProps) {
    return <div className={cn("stack-container", className)}>{children}</div>;
}

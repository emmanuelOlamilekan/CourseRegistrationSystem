import { twMerge } from "tailwind-merge";

interface Props {
  variant?: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

const styles = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function Alert({ variant = "info", children, className }: Props) {
  return (
    <div className={twMerge("rounded-md border px-4 py-3 text-sm", styles[variant], className)}>
      {children}
    </div>
  );
}

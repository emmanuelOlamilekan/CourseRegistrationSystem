import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export default function Card({ title, className, children, ...props }: Props) {
  return (
    <div
      className={twMerge("bg-white rounded-lg border border-gray-200 shadow-sm", className)}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

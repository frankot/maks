import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}


// Simple Card variant for image + title (for category cards)
import Image from "next/image";

export interface SimpleCardProps {
  title: string;
  image: string;
  height?: string;
  className?: string;
}

export function SimpleCard({ title, image, height = "410px", className = "" }: SimpleCardProps) {
  return (
    <div
      className={`w-full overflow-hidden border-t border-black group bg-white flex flex-col ${className}`}
      style={{ height }}
    >
      {/* Image section */}
      <div className="relative w-full flex-1 bg-white" style={{ height: `calc(${height} - 75px)` }}>
        <Image
          src={image || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300 ease-in-out"
          sizes="360px"
        />
      </div>
      {/* Title section */}
      <div className="flex h-[54px] items-center justify-center bg-[#F1F1F1] px-4">
        <h3 className="w-full truncate text-center text-sm  text-gray-900">{title}</h3>
      </div>
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

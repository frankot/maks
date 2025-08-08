'use client'

import { SimpleCard } from "@/components/ui/card";
import Link from "next/link";

const categories = [
	{
		title: "RINGS",
		image: "/products/ring.png",
		height: "410px",
	},
	{
		title: "EARRINGS",
		image: "/products/earing.png",
		height: "410px",
	},
	{
		title: "BRACELETS",
		image: "/products/brac.png",
		height: "410px",
	},
	{
		title: "NECKLACES",
		image: "/products/neck.png",
		height: "615px",
	},
	{
		title: "CHAINS",
		image: "/products/chain.png",
		height: "615px",
	},
];

export default function Sections() {
	return (
		<section className="w-full px-0">
			{/* First row: 3 cards with inner borders */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full">
				{categories.slice(0, 3).map((cat, idx) => (
					<Link
						key={cat.title}
						href={`/shop/${cat.title.toLowerCase()}`}
						className="block"
					>
						<SimpleCard
							title={cat.title}
							image={cat.image}
							height={cat.height}
							className={` ${idx !== 0 ? 'md:border-l md:border-black' : ''}`}
						/>
					</Link>
				))}
			</div>
			{/* Second row: 2 cards with inner borders */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
				{categories.slice(3).map((cat, idx) => (
					<Link
						key={cat.title}
						href={`/shop/${cat.title.toLowerCase()}`}
						className="block"
					>
						<SimpleCard
							title={cat.title}
							image={cat.image}
							height={cat.height}
							className={`border-0 md:border-b md:border-black ${idx !== 0 ? 'md:border-l md:border-black' : ''}`}
						/>
					</Link>
				))}
			</div>
			{/* Responsive: stack cards on mobile */}
			<style jsx>{`
				@media (max-width: 768px) {
					.grid > :global(div) {
						height: 300px !important;
					}
				}
			`}</style>
		</section>
	);
}

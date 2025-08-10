
export default function Footer() {
	return (
			<footer className="w-full">
				{/* Main footer section */}
				<div className="w-full bg-[#10101A] text-white py-12">
					<div className="max-w-7xl mx-auto px-4 flex flex-col items-start">
						<div className="w-full grid grid-cols-4 gap-8 justify-center items-start">
							{/* Logo column */}
							<div className="flex flex-col items-start col-span-1">
								<span className="text-2xl font-bold tracking-widest mb-2 border-b-2 border-white pb-1">66 33 11</span>
							</div>
							{/* Links column 1 */}
							<div className="flex flex-col gap-2 text-sm items-start">
								<span>CONTACT</span>
								<span>ORDERS</span>
								<span>RETURNS</span>
							</div>
							{/* Links column 2 */}
							<div className="flex flex-col gap-2 text-sm items-start">
								<span>HOME</span>
								<span>SHOP</span>
								<span>ABOUT</span>
								<span>GALLERY</span>
							</div>
							{/* Links column 3 */}
							<div className="flex flex-col gap-2 text-sm items-start">
								<span>MAIL</span>
								<span>INSTAGRAM</span>
								<span>FACEBOOK</span>
								<span className="mt-2 underline">Privacy Policy</span>
								<span className="text-xs mt-2">All rights reserved 663311 © 2025</span>
							</div>
						</div>
					</div>
				</div>
				{/* White strip with logo and design credit */}
				<div className="w-full bg-white py-4 flex flex-col md:flex-row items-center md:justify-between px-8 text-black text-xs">
					<div className="hidden md:block w-1/3"></div>
					<span className="font-bold tracking-widest text-lg w-full text-center md:w-1/3 md:text-center">66 33 11</span>
					<span className="w-full text-right md:w-1/3 md:text-right mt-2 md:mt-0">DESIGN BY KNOP STUDIO DESIGN</span>
				</div>
			</footer>
	);
}

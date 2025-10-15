import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16">
        {/* Large full-width logo centered */}
        <div className="flex w-full justify-center">
          <LinkLogoLarge />
        </div>

        {/* small right-aligned link below the logo */}
        <div className="mt-10 w-full">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="flex w-full justify-end text-black">
              <nav aria-label="Footer main links">
                <ul className="flex items-center gap-6 text-sm">
                  <li>
                    <Link href="/shop" className="hover:underline">
                      SHOP
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:underline">
                      ABOUT
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="hover:underline">
                      GALLERY
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* small right-aligned legal link */}
          <div className="mt-4 flex w-full justify-end px-4">
            <Link href="/legal" className="text-xs text-black/70 underline hover:text-black">
              Privacy & Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LinkLogoLarge() {
  // Recreate the big navbar logo but larger and responsive
  return (
    <Link href="/" className="inline-flex items-center align-middle whitespace-nowrap text-black">
      <span className="font-neubold -mr-12 text-4xl font-extrabold tracking-tight uppercase md:text-6xl lg:text-[9.5rem]">
        SPLOT
      </span>
      <span className="mx-4">
        <Image
          src="/sun.png"
          alt="Splot Studio"
          width={520}
          height={520}
          className="inline-block h-28 w-28 object-contain align-middle md:h-40 md:w-40 lg:h-56 lg:w-56"
        />
      </span>
      <span className="font-neubold -ml-8 text-4xl font-extrabold tracking-tight uppercase md:text-6xl lg:text-[9.5rem]">
        STUDIO
      </span>
    </Link>
  );
}

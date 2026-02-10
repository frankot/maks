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
  return (
    <Link href="/" className="text-black">
      <span className="text-4xl font-light tracking-[0.3em] md:text-6xl lg:text-[9.5rem]">
        mami
      </span>
    </Link>
  );
}

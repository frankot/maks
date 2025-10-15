import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import ProductDetailsSection from '@/components/ui/ProductDetailsSection';
import { formatPriceInPLN } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const priceInPLN = formatPriceInPLN(product.priceInGrosz);

  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 lg:items-start lg:gap-x-8">
      {/* Left side - Images in natural flow */}
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="space-y-0 border-r border-black">
          {/* Main product image */}
          <div className="relative h-screen w-full">
            {product.imagePaths[0] ? (
              <Image
                src={product.imagePaths[0]}
                alt={product.name}
                fill
                className="bg-[#F1F1F1] object-cover p-24"
                sizes="50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white">
                <span className="text-lg font-medium text-gray-400">LOADING</span>
              </div>
            )}
          </div>

          {/* Additional images - each taking full screen height */}
          {product.imagePaths.length > 1 &&
            product.imagePaths.slice(1).map((imagePath, index) => (
              <div key={index} className="relative h-screen w-full">
                {imagePath ? (
                  <Image
                    src={imagePath}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white">
                    <span className="text-lg font-medium text-gray-400">LOADING</span>
                  </div>
                )}
              </div>
            ))}

          {/* Add more placeholder images if needed */}
          {product.imagePaths.length === 1 && (
            <>
              <div className="relative h-screen w-full">
                {product.imagePaths[0] ? (
                  <Image
                    src={product.imagePaths[0]}
                    alt={`${product.name} detail`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white">
                    <span className="text-lg font-medium text-gray-400">LOADING</span>
                  </div>
                )}
              </div>
              <div className="relative h-screen w-full">
                {product.imagePaths[0] ? (
                  <Image
                    src={product.imagePaths[0]}
                    alt={`${product.name} close-up`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white">
                    <span className="text-lg font-medium text-gray-400">LOADING</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Sticky Product Info */}
      <div className="lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1">
        <div className="flex h-[700px] flex-col justify-center px-8">
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="text-center">
              <h1 className="text-[28px] leading-8 font-[500] tracking-wide uppercase">
                {product.name}
              </h1>
              <div className="mt-3">
                <p className="text-sm">{priceInPLN} zł</p>
              </div>
              <hr className="mx-auto mt-5 w-20 border-black" />
            </div>

            {/* Product Description */}
            <div className="text-center">
              <p className="text-xs leading-relaxed">{product.description}</p>
            </div>

            {/* Add to Cart Button */}
            <div className="flex justify-center">
              <button className="bg-black px-6 py-2 text-xs tracking-wider text-white uppercase transition-colors hover:bg-gray-800">
                ADD TO CART
              </button>
            </div>
            <div className="mx-auto max-w-md">
              {/* Size Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Size:</span>
                  <a href="#" className="text-xs underline">
                    size guide
                  </a>
                </div>
                <select className="w-full border border-gray-900 px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none">
                  <option>Select size</option>
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>50</option>
                  <option>52</option>
                  <option>54</option>
                  <option>56</option>
                  <option>58</option>
                  <option>60</option>
                </select>
              </div>

              {/* Collapsible Sections */}
              <div className="mt-10 space-y-3">
                {/* Product Description */}
                <ProductDetailsSection title="PRODUCT DESCRIPTION">
                  <p>
                    Handcrafted with precision and attention to detail. This piece embodies the
                    organic yet bold aesthetic of 06.33.11 Studio.
                  </p>
                  <p className="mt-2">
                    Made from premium materials sourced responsibly, each piece tells a unique story
                    of craftsmanship and artistry.
                  </p>
                </ProductDetailsSection>

                <ProductDetailsSection title="PRODUCT DETAILS">
                  <ul className="space-y-1">
                    <li> Handmade in Warsaw, Poland</li>
                    <li> Limited edition piece</li>
                    <li> Comes with authenticity certificate</li>
                    <li> Gift box included</li>
                    <li> 1-year warranty</li>
                  </ul>
                </ProductDetailsSection>

                <ProductDetailsSection title="MATERIAL">
                  <ul className="space-y-1">
                    <li> 925 Sterling Silver</li>
                    <li> Natural gemstones</li>
                    <li> Hypoallergenic materials</li>
                    <li> Ethically sourced</li>
                    <li> Tarnish resistant coating</li>
                  </ul>
                </ProductDetailsSection>

                <ProductDetailsSection title="CARE INSTRUCTIONS">
                  <ul className="space-y-1">
                    <li> Clean with soft cloth</li>
                    <li> Avoid contact with chemicals</li>
                    <li> Store in provided pouch</li>
                    <li> Remove before swimming</li>
                    <li> Professional cleaning recommended</li>
                  </ul>
                </ProductDetailsSection>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

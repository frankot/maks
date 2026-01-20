import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById, getProductBySlug } from '@/lib/products';
import ProductDetailsTabs from '@/app/(customerFacing)/shop/[id]/ProductDetailsTabs';
import { formatPriceInPLN } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product = await getProductBySlug(id);
  if (!product) {
    product = await getProductById(id);
  }

  if (!product) {
    notFound();
  }

  const priceInPLN = formatPriceInPLN(product.priceInGrosz);
  const isSold = product.productStatus === 'ORDERED' || product.productStatus === 'SOLD';

  return (
    <>
      <div className="mt-[calc(var(--nav-height)+var(--collections-bar-height)-7px)] grid grid-cols-1 border-t border-b border-black lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="space-y-0 border-r border-black">
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

        <div className="lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1">
          <div className="flex h-[700px] flex-col justify-center px-8">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-[28px] leading-8 font-[500] tracking-wide uppercase">
                  {product.name}
                </h1>
                <div className="mt-3">
                  <p className="text-sm">{priceInPLN} zł</p>
                </div>
                <hr className="mx-auto mt-5 w-20 border-black" />
              </div>

              <div className="text-center">
                <p className="text-xs leading-relaxed">{product.description}</p>
              </div>

              <div className="flex justify-center">
                {isSold ? (
                  <div className="border border-black bg-white px-6 py-2 text-xs tracking-wider text-black uppercase cursor-not-allowed">
                    SOLD
                  </div>
                ) : (
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      priceInGrosz: product.priceInGrosz,
                      imagePath: product.imagePaths[0],
                      slug: product.slug ?? product.id,
                    }}
                    className="bg-black px-6 py-2 text-xs tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
                  />
                )}
              </div>

              <div className="mx-auto max-w-md">
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

                <ProductDetailsTabs
                  details={
                    <p className="text-sm leading-relaxed">
                      Each piece is handmade in Warsaw, Poland as a limited edition creation. 
                      Your jewelry comes with an authenticity certificate and is beautifully 
                      presented in a gift box. We provide a 1-year warranty for your peace of mind.
                    </p>
                  }
                  material={
                    <ul className="space-y-1 text-sm">
                      <li>• 925 Sterling Silver</li>
                      <li>• Natural gemstones</li>
                      <li>• Hypoallergenic materials</li>
                      <li>• Ethically sourced</li>
                      <li>• Tarnish resistant coating</li>
                    </ul>
                  }
                  care={
                    <p className="text-sm leading-relaxed">
                      Clean gently with a soft cloth and avoid contact with chemicals or water. 
                      Store your jewelry in the provided pouch when not wearing it. Remove before 
                      swimming or exercising. Professional cleaning is recommended annually.
                    </p>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

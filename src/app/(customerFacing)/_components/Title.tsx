interface TitleProps {
  text: string;
  imagePath: string;
}

export default function Title({ text, imagePath }: TitleProps) {
  return (
    <div
      className="relative flex h-[615px] w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${imagePath})` }}
    >
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Title text */}
      <h1 className="relative z-10 px-4 text-center text-4xl leading-10 font-[500] text-white uppercase md:text-[32px]">
        {text}
      </h1>
    </div>
  );
}

export default function HeroBanner() {
  return (
    <div className="px-4 pt-4 pb-2 bg-gray-900">
      <div className="overflow-hidden rounded-2xl">
        <img
          src="/images/banner.jpg"
          alt="Carefully selected for you"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}

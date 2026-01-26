import { Link } from 'react-router-dom';

export const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group cursor-pointer product-card"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0] mb-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="object-cover w-full h-full product-card-image"
          loading="lazy"
        />
        {product.featured && (
          <span className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest px-3 py-1">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-lg text-[#1A1A1A] group-hover:text-[#666666] transition-colors">
          {product.name}
        </h3>
        <p className="font-sans text-sm text-[#666666]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

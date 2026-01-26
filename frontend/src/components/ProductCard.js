import { Link } from 'react-router-dom';

export const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="border rounded bg-white hover:shadow-md transition-shadow"
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm">{product.name}</h3>
        <p className="text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
        {product.featured && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>
    </Link>
  );
};

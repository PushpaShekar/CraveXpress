import { Link } from 'react-router-dom';
import { IProduct } from '../../../types';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  const discountedPrice = product.discount && product.discount > 0
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              {product.discount}% OFF
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{product.category}</p>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-700">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ₹{discountedPrice.toFixed(2)}
              </span>
              {product.discount && product.discount > 0 && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
              <span className="ml-1 text-sm text-gray-600">/ {product.unit}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          {user && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>
          )}
          {!user && (
            <Link
              to="/login"
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              Login to Buy
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;


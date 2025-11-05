import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  discount?: number;
  images: string[];
  tags?: string;
}

const schema: yup.ObjectSchema<ProductForm> = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  category: yup.string().required('Category is required'),
  stock: yup.number().min(0, 'Stock cannot be negative').required('Stock is required'),
  unit: yup.string().required('Unit is required'),
  discount: yup.number().min(0).max(100).optional(),
  images: yup.array().of(yup.string().url().required()).min(1, 'At least one image is required').required(),
  tags: yup.string().optional(),
});

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      discount: 0,
    },
  });

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...imageUrls];
    newImages[index] = value;
    setImageUrls(newImages);
    setValue('images', newImages.filter((url) => url));
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setValue('images', newImages.filter((url) => url));
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const productData = {
        ...data,
        images: imageUrls.filter((url) => url),
        tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
      };

      await api.post('/products', productData);
      toast.success('Product added successfully!');
      navigate('/seller/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="input-field"
              placeholder="Fresh Organic Tomatoes"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              className="input-field"
              rows={4}
              placeholder="Describe your product..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="99.99"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                {...register('stock')}
                type="number"
                className="input-field"
                placeholder="100"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category and Unit */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                {...register('category')}
                type="text"
                className="input-field"
                placeholder="Fruits & Vegetables"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select {...register('unit')} className="input-field">
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="liters">Liters</option>
                <option value="pieces">Pieces</option>
                <option value="dozen">Dozen</option>
                <option value="packets">Packets</option>
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              {...register('discount')}
              type="number"
              min="0"
              max="100"
              className="input-field"
              placeholder="0"
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              {...register('tags')}
              type="text"
              className="input-field"
              placeholder="organic, fresh, local"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (URLs) *
            </label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="btn-outline mt-2"
            >
              Add Another Image
            </button>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;


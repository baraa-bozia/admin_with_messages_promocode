import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardProducts() {
    interface Product {
  _id: string;
  name: {
    en: string;
    ar: string;
  } | string; 
  description: {
    en: string;
    ar: string;
  } | string;
  price: number;
  stock: number;
  images: { url: string; isPrimary: boolean }[];
  colors: {
    name: { en: string; ar: string };
    image: string;
  }[];
  isActive: boolean;
}


const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data.data.products);
      console.log(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Colors</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <tr key={product._id} className="text-center">
              {/* الصورة */}
              <td className="border p-2">
               
                <div className="flex flex-wrap gap-3">
  {product.images.map((img, idx) => (
    <img
      key={img._id || idx}
      src={img.url}
      alt={img.alt?.en || 'product image'}
      className="w-24 h-24 object-cover rounded border"
    />
  ))}
</div>

              </td>

              <td className="border p-2">
                {product.name.en}
              </td>
             

              <td className="border p-2">
                ₪ {product.price}
              </td>

              <td className="border p-2">
                {product.stock}
              </td>

              <td className="border p-2">
                <div className="flex flex-wrap gap-1 justify-center">
                  {product.colors?.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-gray-200 rounded"
                    >
                      {c.name.en}
                    </span>
                  ))}
                </div>
              </td>

              <td className="border p-2">
                {product.isActive ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactive</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

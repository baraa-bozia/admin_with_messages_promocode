

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
      const navigate = useNavigate();

type ImageType = File; 

type ProductType = {
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  price: number;
  stock: number;
  images: ImageType[];
  variants: any[]; 
};

const [product, setProduct] = useState<ProductType>({
  name: { en: "", ar: "" },
  description: { en: "", ar: "" },
  price: 0,
  stock: 0,
  images: [], 
  variants: []
});


  type VariantType = {
  name: { en: string; ar: string };
  value?: { en: string; ar: string }; 
  price: number;
  stock: number;
  image: File | null; 
    imagePreview?: string;

};

const [variant, setVariant] = useState<VariantType>({
  name: { en: "", ar: "" },
  value: { en: "", ar: "" }, 
  price: 0,
  stock: 0,
  image: null,
  imagePreview:"",
});


    const [imagePreviews, setImagePreviews] = useState<string[]>([]);


const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  setProduct(prev => ({
    ...prev,
    images: [...prev.images, ...files],
  }));

  const previews = files.map(file => URL.createObjectURL(file));
  setImagePreviews(prev => [...prev, ...previews]);

  e.target.value = '';
};



  const addVariant = () => {
  if (!variant.image) {
    alert("Please upload an image for the variant");
    return;
  }

  // لو الادمن ما دخل سعر، بستخدم سعر المنتج
  const finalPrice = variant.price || product.price;

  const preview = URL.createObjectURL(variant.image);

  setProduct(prev => ({
    ...prev,
    variants: [
      ...prev.variants,
      {
        ...variant,
        price: finalPrice, 
        imagePreview: preview,
      },
    ],
  }));

  setVariant({
    name: { en: "", ar: "" },
    value: { en: "", ar: "" },
    price: 0,
    stock: 0,
    image: null,
    imagePreview: "",
  });
};




const handleSubmit = async () => {
  
  try {
    const { name, description, price, stock, images, variants } = product;

  if (!product.name?.en || !product.name?.ar) {
      return alert("Please fill in the product name in both languages");
    }

    if (!product.description?.en || !product.description?.ar) {
      return alert("Please fill in the product description in both languages");
    }

    if (!product.price) {
      return alert("Please enter the product price");
    }

    if (!product.stock) {
      return alert("Please enter the stock quantity");
    }

    if (!product.images || product.images.length === 0) {
      return alert("Please upload at least one product image");
    }


    const sku = `PRD-${Date.now()}`; 
    console.log(product.variants);



    const res = await axios.post('http://localhost:5000/api/products', { name, description, price, stock,sku });
    const productId = res.data.data._id;
// console.log(res.data.data);
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img)); // key = 'images'
      await axios.post(`http://localhost:5000/api/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    
    for (let v of variants) {
  const formData = new FormData();

  formData.append('name', JSON.stringify(v.name));   // { en, ar }
  formData.append('value', JSON.stringify(v.value)); // { en, ar }
  formData.append('price', v.price.toString());
  formData.append('stock', v.stock.toString());

  if (v.image) formData.append('image', v.image); // File

  try {
    const variantRes = await axios.post(
      `http://localhost:5000/api/products/${productId}/variants`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    console.log("Added variant:", variantRes.data.data);

  } catch (err) {
    console.error("Error adding variant:", err.response?.data || err.message);
  }
}
console.log("all data :",res.data.data);

    console.log(product.variants);
    alert('Product added successfully!');
setVariant({
  name: { en: "", ar: "" },
  value: { en: "", ar: "" }, 
  price: 0,
  stock: 0,
  image: null
})
    setProduct({
      name: { en: '', ar: '' },
      description: { en: '', ar: '' },
      price: 0,
      stock: 0,
      images: [],
      variants: []
    });
    setImagePreviews([]);
  } catch (err) {
    console.error(err);
    alert('Error adding product');
  }
};

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
        <div className="flex items-center justify-between mb-10">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <Button
        variant="outline"
        size="lg"
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 rounded-xl border-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Button>
    </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Name EN"
          value={product.name.en}
          onChange={e => setProduct(prev => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Name AR"
          value={product.name.ar}
          onChange={e => setProduct(prev => ({ ...prev, name: { ...prev.name, ar: e.target.value } }))}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Description EN"
          value={product.description.en}
          onChange={e => setProduct(prev => ({ ...prev, description: { ...prev.description, en: e.target.value } }))}
          className="border p-2 rounded col-span-1 md:col-span-2"
        />
        <textarea
          placeholder="Description AR"
          value={product.description.ar}
          onChange={e => setProduct(prev => ({ ...prev, description: { ...prev.description, ar: e.target.value } }))}
          className="border p-2 rounded col-span-1 md:col-span-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={e => setProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={product.stock}
          onChange={e => setProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
          className="border p-2 rounded"
        />
      </div>

      {/* Product Images */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Upload Product Images</label>

        <label className="cursor-pointer border-2 border-dashed p-6 rounded text-center block">
  <p className="text-gray-600 font-medium">
    {imagePreviews.length === 0
      ? 'Click to upload product images'
      : 'You can add more images'}
  </p>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImagesChange}
    className="hidden"
  />
</label>

        
        <div className="flex flex-wrap gap-2">
  {imagePreviews.map((src, idx) => (
    <img
      key={idx}
      src={src}
      alt="preview"
      onClick={() => {
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
        setProduct(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== idx),
        }));
      }}
      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-70"
      title="Click to remove"
    />
  ))}
</div>

      </div>

      <hr className="my-6" />

      {/* Variants */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Add Color</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Color Name EN"
            value={variant.name.en}
            onChange={e => setVariant(prev => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Color Name AR"
            value={variant.name.ar}
            onChange={e => setVariant(prev => ({ ...prev, name: { ...prev.name, ar: e.target.value } }))}
            className="border p-2 rounded"
          />
       
<input
  type="number"
  placeholder="Variant Price"
  value={variant.price || product.price} // لو ما دخل الادمن، يظهر سعر المنتج
  onChange={e => {
    const newPrice = parseFloat(e.target.value);
    setVariant(prev => ({
      ...prev,
      price: isNaN(newPrice) ? 0 : newPrice, // إذا مسح الادمن، نخليه 0 عشان ياخد سعر المنتج عند الإضافة
    }));
  }}
  className="border p-2 rounded"
/>

      
          <input
            type="number"
            placeholder="Variant Stock"
            value={variant.stock}
            onChange={e => setVariant(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
            className="border p-2 rounded"
          />
      
      <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVariant(prev => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }}
    className="border p-2 rounded" 

/>
 

        </div>
        <button type="button" onClick={addVariant} className="bg-black text-white px-4 py-2 rounded">Add Color</button>

        {product.variants.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Variants List:</h4>
            <ul className="list-disc pl-5">
           
              {product.variants.map((v, i) => (
  <li key={i} className="flex items-center gap-3">
    <span>
      {v.name.en} : {v.value.en}
    </span>

    {v.imagePreview && (
      <img
        src={v.imagePreview}
        alt="variant"
        className="w-12 h-12 object-cover rounded border"
      />
    )}

    <span>
    
Price: {v.price !== undefined && v.price !== null ? v.price : product.price} ,
       Stock: {v.stock}
    </span>
  </li>
))}

            </ul>
          </div>
        )}
      </div>
<div className="flex justify-center mt-4">
  <button onClick={handleSubmit} className="bg-black text-white px-6 py-3 rounded text-lg">
    Save Product
  </button>
</div>

    </div>
  );
}

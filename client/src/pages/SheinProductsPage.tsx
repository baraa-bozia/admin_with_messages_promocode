// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Trash2, Pencil,RefreshCcw } from "lucide-react";
// import axios from "axios";
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export interface SheinProduct {
//   _id: string;
//   title: string;
//   mainPictureUrl: string;
//   originalPrice: number;
//   currencySign: string;
// }

// const SheinProductsPage = () => {
//               const navigate = useNavigate();

//   const [products, setProducts] = useState<SheinProduct[]>([]);
//   const [loading, setLoading] = useState(false);
//     const [selectedCategory, setSelectedCategory] = useState<string>("all");


//   // Pagination
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [hasMore, setHasMore] = useState(true);

// const fetchProducts = async (category: string = "all", pageNum: number = 1) => {
//   try {
//     setLoading(true);
//     const res = await axios.get("http://localhost:5000/api/shein", {
//       params: { category,page: pageNum, limit }

//     });

//     const productsData = res.data.data || [];
//     const pagination = res.data.pagination || {};
//     console.log(productsData)
//     setProducts(productsData);
//     setPage(pagination.page || 1);
//     setHasMore(pagination.hasMore ?? false);
//   } catch (error) {
//     console.error("Failed to fetch shein products", error);
//   } finally {
//     setLoading(false);
//   }
// };



//   useEffect(() => {
//     fetchProducts(selectedCategory,1); // page 1
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//         <div className="flex items-center justify-between mb-10">
//             <div>
//         <h1 className="text-3xl font-bold">Shein Products List</h1>
      
//    </div>
//       <Button disabled className="flex gap-2">
//           <RefreshCcw className="w-4 h-4" />
//          Update Products
//        </Button>
//  <Button
//         variant="outline"
//         size="lg"
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-3 rounded-xl border-2"
//       >
//         <ArrowLeft className="w-5 h-5" />
//         Back
//       </Button>
      
//       </div>

//       <Card>
//         <CardContent>
//           {loading ? (
//             <p>Loading...</p>
//           ) : products.length === 0 ? (
//             <p>No products found</p>
//           ) : (
//             <>

// <div className="flex items-center justify-between mb-4">
  
//   {/* Categories */}
//   <div className="flex gap-2">
//     {["all", "women", "men"].map((cat) => (
//       <Button
//         key={cat}
//         size="sm"
//         variant={selectedCategory === cat ? "default" : "outline"}
//         onClick={() => {
//           setSelectedCategory(cat);
//           fetchProducts(cat,1); 
//         }}
//       >
//         {cat.toUpperCase()}
//       </Button>
//     ))}
//   </div>
// </div>


//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Image</TableHead>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Price</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {products.map((item) => (
//                     <TableRow key={item._id}>
//                       <TableCell>
//                         <img src={item.mainPictureUrl} alt={item.title} className="w-12 h-12 rounded object-cover" />
//                       </TableCell>
//                       <TableCell>{item.title}</TableCell>
//                       <TableCell>{item.currencySign}{item.originalPrice}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button size="sm" variant="outline">
//                             <Pencil className="w-4 h-4" />
//                           </Button>
//                           <Button size="sm" variant="destructive">
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {/* Pagination */}
//               <div className="flex justify-between mt-4">
//                 <Button onClick={() => fetchProducts(selectedCategory,page - 1)} disabled={page === 1}>
//                   Previous
//                 </Button>
//                 <span>Page {page}</span>
//                 <Button onClick={() => fetchProducts(selectedCategory,page + 1)} disabled={!hasMore}>
//                   Next
//                 </Button>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SheinProductsPage;

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, RefreshCcw } from "lucide-react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SheinProduct {
  _id: string;
  title: string;
  mainPictureUrl: string;
  originalPrice: number;
  currencySign: string;
  category?: string;
}
const CATEGORY_LIST = ["all", "women", "men", "shoes", "electronics", "kids","curve","beauty"
    ,"home","sports","underwear","baby","toys","textile"];

const SheinProductsPage = () => {
    
  const navigate = useNavigate();

  const [products, setProducts] = useState<SheinProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
const [editProduct, setEditProduct] = useState<SheinProduct | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);


const handleDelete = async (id: string) => {
  if (window.confirm("Are you sure you want to delete this product?")) {
    try {
      await axios.delete(`http://localhost:5000/api/shein/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Failed to delete product");
    }
  }
};

const handleEdit = (product: SheinProduct) => {
  setEditProduct(product);
};



  const fetchProducts = useCallback(
    async (category: string = "all", pageNum: number = 1) => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/shein", {
          params: { category, page: pageNum, limit },
        });
        const productsData = res.data.data || [];
        const pagination = res.data.pagination || {};
        setProducts(productsData);
        setPage(pagination.page || 1);
        setHasMore(pagination.hasMore ?? false);
      } catch (error) {
        console.error("Failed to fetch shein products", error);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // Fetch on mount or category change
  useEffect(() => {
    fetchProducts(selectedCategory, 1);
  }, [selectedCategory, fetchProducts]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Shein Products List</h1>
        <div className="flex gap-2">
          <Button disabled className="flex gap-2">
            <RefreshCcw className="w-4 h-4" />
            Update Products
          </Button>
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
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4">
        {CATEGORY_LIST.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
              fetchProducts(cat, 1);
            }}
          >
            {cat.toUpperCase()}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <img
                          src={item.mainPictureUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        {item.currencySign}
                        {item.originalPrice}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between mt-4">
                <Button
                  onClick={() => fetchProducts(selectedCategory, page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button
                  onClick={() => fetchProducts(selectedCategory, page + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

{editProduct && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.put(`http://localhost:5000/api/shein/${editProduct._id}`, editProduct);
              setEditProduct(null);
              fetchProducts(selectedCategory, page);
            } catch (err) {
              console.error("Failed to update product", err);
              alert("Failed to update product");
            }
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="title"
            value={editProduct.title}
            onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="mainPictureUrl"
            value={editProduct.mainPictureUrl}
            onChange={(e) => setEditProduct({ ...editProduct, mainPictureUrl: e.target.value })}
            className="w-full border rounded p-2"
          />
          <input
            type="number"
            name="originalPrice"
            value={editProduct.originalPrice}
            onChange={(e) => setEditProduct({ ...editProduct, originalPrice: Number(e.target.value) })}
            className="w-full border rounded p-2"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setEditProduct(null)} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)}


    </div>
  );
};

export default SheinProductsPage;

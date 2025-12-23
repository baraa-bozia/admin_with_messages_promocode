import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil,RefreshCcw } from "lucide-react";
import axios from "axios";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SheinProduct {
  _id: string;
  title: string;
  mainPictureUrl: string;
  originalPrice: number;
  currencySign: string;
}

const SheinProductsPage = () => {
              const navigate = useNavigate();

  const [products, setProducts] = useState<SheinProduct[]>([]);
  const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");


  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);

const fetchProducts = async (category: string = "all", pageNum: number = 1) => {
  try {
    setLoading(true);
    const res = await axios.get("http://localhost:5000/api/shein", {
      params: { category,page: pageNum, limit }

    });

    const productsData = res.data.data || [];
    const pagination = res.data.pagination || {};
    console.log(productsData)
    setProducts(productsData);
    setPage(pagination.page || 1);
    setHasMore(pagination.hasMore ?? false);
  } catch (error) {
    console.error("Failed to fetch shein products", error);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchProducts(selectedCategory,1); // page 1
  }, []);

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-10">
            <div>
        <h1 className="text-3xl font-bold">Shein Products List</h1>
      
   </div>
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

      <Card>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <>

<div className="flex items-center justify-between mb-4">
  
  {/* Categories */}
  <div className="flex gap-2">
    {["all", "women", "men"].map((cat) => (
      <Button
        key={cat}
        size="sm"
        variant={selectedCategory === cat ? "default" : "outline"}
        onClick={() => {
          setSelectedCategory(cat);
          fetchProducts(cat,1); 
        }}
      >
        {cat.toUpperCase()}
      </Button>
    ))}
  </div>
</div>


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
                        <img src={item.mainPictureUrl} alt={item.title} className="w-12 h-12 rounded object-cover" />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.currencySign}{item.originalPrice}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
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
                <Button onClick={() => fetchProducts(selectedCategory,page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button onClick={() => fetchProducts(selectedCategory,page + 1)} disabled={!hasMore}>
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SheinProductsPage;

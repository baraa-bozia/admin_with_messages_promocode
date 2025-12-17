<<<<<<< HEAD
// src/components/admin/HeroImages.tsx
import React, { useState, useEffect } from 'react';
import { heroImagesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Selectt, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Upload } from 'lucide-react';

interface HeroImage {
  _id: string;
  url: string;
  alt: string;
  order: number;
  isActive: boolean;
  categorySlug: string;
}

const CATEGORY_OPTIONS = [
  'all',
  'women',
  'men',
  'electronics',
  'kids',
  'shoes',
  'beauty',
  'home',
  'sports',
  'curve',
] as const;

type CategorySlug = typeof CATEGORY_OPTIONS[number];

const HeroImages: React.FC = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newImage, setNewImage] = useState({
    imageFile: null as File | null,
    alt: '',
    order: 0,
    isActive: true,
    categorySlug: 'all' as CategorySlug,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<Partial<HeroImage & { imageFile?: File | null }>>({
    imageFile: null,
  });

  useEffect(() => {
    fetchImages();
  }, []);
  const handleDeleteImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      await heroImagesAPI.delete(id);
      toast.success('Hero image deleted successfully.');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete hero image.');
    }
  };
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await heroImagesAPI.getAll();
      setImages(res.data);
    } catch (err) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImage.imageFile) return toast.error('Please select an image');

    const formData = new FormData();
    formData.append('image', newImage.imageFile);
    formData.append('alt', newImage.alt || 'Hero Image');
    formData.append('order', newImage.order.toString());
    formData.append('isActive', newImage.isActive.toString());
    formData.append('categorySlug', newImage.categorySlug);

    try {
      await heroImagesAPI.create(formData); // No headers needed — api.ts handles it!
      toast.success('Image uploaded successfully!');
      setIsAdding(false);
      setNewImage({ imageFile: null, alt: '', order: 0, isActive: true, categorySlug: 'all' });
      fetchImages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleUpdateImage = async (id: string) => {
    const formData = new FormData();
    if (editingImage.imageFile) formData.append('image', editingImage.imageFile);
    if (editingImage.alt !== undefined) formData.append('alt', editingImage.alt);
    if (editingImage.order !== undefined) formData.append('order', editingImage.order.toString());
    if (editingImage.isActive !== undefined) formData.append('isActive', editingImage.isActive.toString());
    if (editingImage.categorySlug !== undefined) formData.append('categorySlug', editingImage.categorySlug);

    try {
      await heroImagesAPI.update(id, formData);
      toast.success('Updated successfully!');
      setEditingId(null);
      setEditingImage({ imageFile: null });
      fetchImages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const startEdit = (img: HeroImage) => {
    setEditingId(img._id);
    setEditingImage({ ...img, imageFile: null });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingImage({ imageFile: null });
  };

  if (loading) return <div className="p-10 text-center">Loading hero images...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Hero Images Management</CardTitle>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'Cancel' : 'Add New Image'}
        </Button>
      </CardHeader>

      <CardContent>
        {/* Add New Form */}
        {isAdding && (
          <div className="mb-8 p-6 border-2 border-dashed rounded-xl bg-gray-50">
            <h3 className="text-lg font-bold mb-5">Upload New Hero Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
              {/* Image */}
              <div className="space-y-2">
                <Label>Image <span className="text-red-500">*</span></Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage({ ...newImage, imageFile: e.target.files?.[0] || null })}
                />
                {newImage.imageFile && (
                  <img
                    src={URL.createObjectURL(newImage.imageFile)}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={newImage.alt}
                  onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                  placeholder="e.g. Summer Sale 2025"
                />
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={newImage.order}
                  onChange={(e) => setNewImage({ ...newImage, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Selectt
                  value={newImage.categorySlug}
                  onValueChange={(value) => setNewImage({ ...newImage, categorySlug: value as CategorySlug })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Selectt>
              </div>

              {/* Active + Upload Button */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={newImage.isActive}
                    onCheckedChange={(v) => setNewImage({ ...newImage, isActive: v })}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleAddImage} disabled={!newImage.imageFile} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Preview</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((img) => (
              <TableRow key={img._id}>
                <TableCell>
                  <img src={img.url} alt={img.alt} className="w-20 h-20 object-cover rounded border" />
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Input value={editingImage.alt || ''} onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })} />
                  ) : (
                    img.alt
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Input type="number" value={editingImage.order || 0} onChange={(e) => setEditingImage({ ...editingImage, order: +e.target.value })} className="w-20" />
                  ) : (
                    img.order
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Selectt
                      value={editingImage.categorySlug || 'all'}
                      onValueChange={(v) => setEditingImage({ ...editingImage, categorySlug: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Selectt>
                  ) : (
                    <span className="font-medium capitalize">{img.categorySlug}</span>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Switch
                      checked={editingImage.isActive ?? true}
                      onCheckedChange={(v) => setEditingImage({ ...editingImage, isActive: v })}
                    />
                  ) : img.isActive ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {editingId === img._id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleUpdateImage(img._id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(img)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteImage(img._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HeroImages;
||||||| empty tree
=======
// src/components/admin/HeroImages.tsx
import React, { useState, useEffect } from 'react';
import { heroImagesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Upload } from 'lucide-react';

interface HeroImage {
  _id: string;
  url: string;
  alt: string;
  order: number;
  isActive: boolean;
  categorySlug: string;
}

const CATEGORY_OPTIONS = [
  'all',
  'women',
  'men',
  'electronics',
  'kids',
  'shoes',
  'beauty',
  'home',
  'sports',
  'curve',
] as const;

type CategorySlug = typeof CATEGORY_OPTIONS[number];

const HeroImages: React.FC = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newImage, setNewImage] = useState({
    imageFile: null as File | null,
    alt: '',
    order: 0,
    isActive: true,
    categorySlug: 'all' as CategorySlug,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<Partial<HeroImage & { imageFile?: File | null }>>({
    imageFile: null,
  });

  useEffect(() => {
    fetchImages();
  }, []);
  const handleDeleteImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      await heroImagesAPI.delete(id);
      toast.success('Hero image deleted successfully.');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete hero image.');
    }
  };
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await heroImagesAPI.getAll();
      setImages(res.data);
    } catch (err) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImage.imageFile) return toast.error('Please select an image');

    const formData = new FormData();
    formData.append('image', newImage.imageFile);
    formData.append('alt', newImage.alt || 'Hero Image');
    formData.append('order', newImage.order.toString());
    formData.append('isActive', newImage.isActive.toString());
    formData.append('categorySlug', newImage.categorySlug);

    try {
      await heroImagesAPI.create(formData); // No headers needed — api.ts handles it!
      toast.success('Image uploaded successfully!');
      setIsAdding(false);
      setNewImage({ imageFile: null, alt: '', order: 0, isActive: true, categorySlug: 'all' });
      fetchImages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleUpdateImage = async (id: string) => {
    const formData = new FormData();
    if (editingImage.imageFile) formData.append('image', editingImage.imageFile);
    if (editingImage.alt !== undefined) formData.append('alt', editingImage.alt);
    if (editingImage.order !== undefined) formData.append('order', editingImage.order.toString());
    if (editingImage.isActive !== undefined) formData.append('isActive', editingImage.isActive.toString());
    if (editingImage.categorySlug !== undefined) formData.append('categorySlug', editingImage.categorySlug);

    try {
      await heroImagesAPI.update(id, formData);
      toast.success('Updated successfully!');
      setEditingId(null);
      setEditingImage({ imageFile: null });
      fetchImages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const startEdit = (img: HeroImage) => {
    setEditingId(img._id);
    setEditingImage({ ...img, imageFile: null });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingImage({ imageFile: null });
  };

  if (loading) return <div className="p-10 text-center">Loading hero images...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Hero Images Management</CardTitle>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'Cancel' : 'Add New Image'}
        </Button>
      </CardHeader>

      <CardContent>
        {/* Add New Form */}
        {isAdding && (
          <div className="mb-8 p-6 border-2 border-dashed rounded-xl bg-gray-50">
            <h3 className="text-lg font-bold mb-5">Upload New Hero Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
              {/* Image */}
              <div className="space-y-2">
                <Label>Image <span className="text-red-500">*</span></Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage({ ...newImage, imageFile: e.target.files?.[0] || null })}
                />
                {newImage.imageFile && (
                  <img
                    src={URL.createObjectURL(newImage.imageFile)}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={newImage.alt}
                  onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                  placeholder="e.g. Summer Sale 2025"
                />
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={newImage.order}
                  onChange={(e) => setNewImage({ ...newImage, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newImage.categorySlug}
                  onValueChange={(value) => setNewImage({ ...newImage, categorySlug: value as CategorySlug })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active + Upload Button */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={newImage.isActive}
                    onCheckedChange={(v) => setNewImage({ ...newImage, isActive: v })}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleAddImage} disabled={!newImage.imageFile} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Preview</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((img) => (
              <TableRow key={img._id}>
                <TableCell>
                  <img src={img.url} alt={img.alt} className="w-20 h-20 object-cover rounded border" />
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Input value={editingImage.alt || ''} onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })} />
                  ) : (
                    img.alt
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Input type="number" value={editingImage.order || 0} onChange={(e) => setEditingImage({ ...editingImage, order: +e.target.value })} className="w-20" />
                  ) : (
                    img.order
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Select
                      value={editingImage.categorySlug || 'all'}
                      onValueChange={(v) => setEditingImage({ ...editingImage, categorySlug: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium capitalize">{img.categorySlug}</span>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === img._id ? (
                    <Switch
                      checked={editingImage.isActive ?? true}
                      onCheckedChange={(v) => setEditingImage({ ...editingImage, isActive: v })}
                    />
                  ) : img.isActive ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {editingId === img._id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleUpdateImage(img._id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(img)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteImage(img._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HeroImages;
>>>>>>> c45867c8fefdeeebcb77fce11e86c804345ebc40

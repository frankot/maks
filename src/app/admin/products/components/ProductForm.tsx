"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    priceInGrosz: "",
    priceInCents: "",
    description: "",
    isAvailable: true,
  });

  const isEditing = Boolean(productId);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const product = await response.json();
            setFormData({
              name: product.name,
              priceInGrosz: (product.priceInGrosz / 100).toString(),
              priceInCents: (product.priceInCents / 100).toString(),
              description: product.description,
              isAvailable: product.isAvailable,
            });
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        priceInGrosz: Math.round(parseFloat(formData.priceInGrosz) * 100),
        priceInCents: Math.round(parseFloat(formData.priceInCents) * 100),
        description: formData.description,
        isAvailable: formData.isAvailable,
      };

      let response;
      if (isEditing && productId) {
        response = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/products");
        }
      } else {
        const errorData = await response.json();
        console.error("Error saving product:", errorData.error);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isAvailable">Available</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) =>
                handleInputChange("isAvailable", checked)
              }
            />
            <Label htmlFor="isAvailable" className="text-sm text-gray-600">
              {formData.isAvailable ? "Available" : "Unavailable"}
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priceInGrosz">Price (PLN)</Label>
          <Input
            id="priceInGrosz"
            type="number"
            step="0.01"
            min="0"
            value={formData.priceInGrosz}
            onChange={(e) => handleInputChange("priceInGrosz", e.target.value)}
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceInCents">Price (EUR)</Label>
          <Input
            id="priceInCents"
            type="number"
            step="0.01"
            min="0"
            value={formData.priceInCents}
            onChange={(e) => handleInputChange("priceInCents", e.target.value)}
            required
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          required
          placeholder="Enter product description"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

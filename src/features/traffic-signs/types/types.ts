export type TrafficSignCategory = {
  id: string; // UUID kullanıyoruz artık
  name: string;
  value: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trafficSigns: number;
  };
};

export interface TrafficSign {
  id: string;
  name: string;
  categoryId: string; // UUID kullanıyoruz artık
  categoryName: string; // Kategori adını da ekledik
  imageUrl?: string; // Optional yapıyoruz
  description?: string; // Optional yapıyoruz
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    value: string;
  };
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Smartphone,
} from "lucide-react";
import { formatPrice, getConditionColor, getStatusColor, POPULAR_BRANDS } from "@/lib/utils";

// Mock data - replace with Supabase
const mockPhones = [
  { id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight", imei_1: "123456789012345", condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900, status: "Available", created_at: "2024-12-25" },
  { id: "2", brand: "Samsung", model_name: "Galaxy S23", variant: "8GB/256GB", color: "Phantom Black", imei_1: "123456789012346", condition_grade: "A", battery_health_percent: 88, selling_price_paise: 4899900, status: "Available", created_at: "2024-12-24" },
  { id: "3", brand: "OnePlus", model_name: "11R 5G", variant: "8GB/128GB", color: "Sonic Black", imei_1: "123456789012347", condition_grade: "A+", battery_health_percent: 95, selling_price_paise: 3199900, status: "Available", created_at: "2024-12-23" },
  { id: "4", brand: "Apple", model_name: "iPhone 12", variant: "64GB", color: "Blue", imei_1: "123456789012348", condition_grade: "B+", battery_health_percent: 84, selling_price_paise: 3499900, status: "Reserved", created_at: "2024-12-22" },
  { id: "5", brand: "Xiaomi", model_name: "Redmi Note 12 Pro", variant: "8GB/128GB", color: "Glacier Blue", imei_1: "123456789012349", condition_grade: "A", battery_health_percent: 96, selling_price_paise: 1899900, status: "Available", created_at: "2024-12-21" },
  { id: "6", brand: "Samsung", model_name: "Galaxy A54 5G", variant: "8GB/256GB", color: "Awesome Graphite", imei_1: "123456789012350", condition_grade: "A+", battery_health_percent: 98, selling_price_paise: 2799900, status: "Sold", created_at: "2024-12-20" },
  { id: "7", brand: "Apple", model_name: "iPhone 14 Pro", variant: "256GB", color: "Deep Purple", imei_1: "123456789012351", condition_grade: "A", battery_health_percent: 90, selling_price_paise: 8999900, status: "Available", created_at: "2024-12-19" },
  { id: "8", brand: "OnePlus", model_name: "Nord CE 3", variant: "8GB/128GB", color: "Aqua Surge", imei_1: "123456789012352", condition_grade: "B+", battery_health_percent: 91, selling_price_paise: 2299900, status: "Available", created_at: "2024-12-18" },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPhones = mockPhones.filter((phone) => {
    const matchesSearch = 
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.imei_1.includes(searchQuery);
    const matchesBrand = brandFilter === "all" || phone.brand === brandFilter;
    const matchesStatus = statusFilter === "all" || phone.status === statusFilter;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-600 mt-1">Manage your phone inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/admin/inventory/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Phone
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by brand, model, or IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {POPULAR_BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            All Phones ({filteredPhones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>IMEI</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPhones.map((phone) => (
                  <TableRow key={phone.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {phone.brand} {phone.model_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {phone.variant} • {phone.color}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {phone.imei_1.slice(0, 6)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionColor(phone.condition_grade)}>
                        {phone.condition_grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              phone.battery_health_percent >= 80 ? 'bg-green-500' :
                              phone.battery_health_percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${phone.battery_health_percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{phone.battery_health_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(phone.selling_price_paise)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(phone.status)}>
                        {phone.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPhones.length === 0 && (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">No phones found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

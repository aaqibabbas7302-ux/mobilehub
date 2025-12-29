import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  TrendingUp,
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// Mock data - replace with actual Supabase queries
const stats = {
  totalPhones: 156,
  availablePhones: 89,
  soldThisMonth: 34,
  totalRevenue: 15678900, // in paise
  pendingInquiries: 12,
  newCustomers: 8,
};

const recentPhones = [
  { id: 1, brand: "Apple", model: "iPhone 13", price: 5299900, status: "Available", condition: "A+" },
  { id: 2, brand: "Samsung", model: "Galaxy S23", price: 4899900, status: "Reserved", condition: "A" },
  { id: 3, brand: "OnePlus", model: "11R 5G", price: 3199900, status: "Available", condition: "A+" },
  { id: 4, brand: "Apple", model: "iPhone 12", price: 3499900, status: "Sold", condition: "B+" },
];

const topBrands = [
  { brand: "Apple", count: 45, percentage: 29 },
  { brand: "Samsung", count: 38, percentage: 24 },
  { brand: "OnePlus", count: 28, percentage: 18 },
  { brand: "Xiaomi", count: 22, percentage: 14 },
  { brand: "Others", count: 23, percentage: 15 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h2>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link href="/admin/inventory/new">
          <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Smartphone className="w-4 h-4 mr-2" />
            Add New Phone
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPhones}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.availablePhones} available
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.soldThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInquiries}</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {stats.newCustomers} new customers
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Phones */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Inventory</CardTitle>
            <Link href="/admin/inventory" className="text-sm text-blue-600 hover:underline flex items-center">
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPhones.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-white border flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{phone.brand} {phone.model}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={
                          phone.condition === 'A+' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          phone.condition === 'A' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }>
                          Grade {phone.condition}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(phone.price)}</p>
                    <Badge variant="outline" className={
                      phone.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                      phone.status === 'Reserved' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                      {phone.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBrands.map((item) => (
                <div key={item.brand}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.brand}</span>
                    <span className="text-sm text-gray-500">{item.count} phones</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/inventory/new" className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
              <Smartphone className="w-8 h-8 mx-auto text-gray-400 group-hover:text-blue-600" />
              <p className="mt-2 font-medium text-gray-700 group-hover:text-blue-700">Add Phone</p>
            </Link>
            <Link href="/admin/orders/new" className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors text-center group">
              <ShoppingCart className="w-8 h-8 mx-auto text-gray-400 group-hover:text-green-600" />
              <p className="mt-2 font-medium text-gray-700 group-hover:text-green-700">Create Order</p>
            </Link>
            <Link href="/admin/customers/new" className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group">
              <Users className="w-8 h-8 mx-auto text-gray-400 group-hover:text-purple-600" />
              <p className="mt-2 font-medium text-gray-700 group-hover:text-purple-700">Add Customer</p>
            </Link>
            <Link href="/admin/inquiries" className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-colors text-center group">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-400 group-hover:text-orange-600" />
              <p className="mt-2 font-medium text-gray-700 group-hover:text-orange-700">View Inquiries</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

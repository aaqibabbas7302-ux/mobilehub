"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  Instagram,
  Facebook,
  MessageSquare,
  Phone,
  Mail,
  MoreVertical,
  Loader2,
  UserPlus,
  ArrowUpRight,
  Tag,
  Globe,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  source_campaign: string | null;
  platform_user_id: string | null;
  platform_username: string | null;
  profile_picture_url: string | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  last_contacted_at: string | null;
  converted_at: string | null;
  customer_id: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  interested: number;
  converted: number;
  bySource: {
    instagram: number;
    facebook: number;
    whatsapp: number;
    website: number;
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-400" },
  contacted: { label: "Contacted", color: "bg-yellow-500/20 text-yellow-400" },
  interested: { label: "Interested", color: "bg-green-500/20 text-green-400" },
  converted: { label: "Converted", color: "bg-purple-500/20 text-purple-400" },
  not_interested: { label: "Not Interested", color: "bg-gray-500/20 text-gray-400" },
  spam: { label: "Spam", color: "bg-red-500/20 text-red-400" },
};

const sourceConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500" },
  facebook: { label: "Facebook", icon: Facebook, color: "text-blue-500" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  website: { label: "Website", icon: Globe, color: "text-orange-500" },
  manual: { label: "Manual", icon: UserPlus, color: "text-gray-500" },
};

function LeadsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  // New lead form
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    source: "manual",
    notes: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterSource !== "all") params.append("source", filterSource);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setLeads(data.leads || []);
        setStats(data.stats || null);
      }
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [search, filterSource, filterStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAddLead = async () => {
    if (!newLead.name && !newLead.phone && !newLead.email) {
      toast.error("Please provide at least name, phone, or email");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Lead added successfully");
        setShowAddModal(false);
        setNewLead({ name: "", phone: "", email: "", source: "manual", notes: "" });
        fetchLeads();
      }
    } catch {
      toast.error("Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status }),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Status updated");
        setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleConvertToCustomer = async (lead: Lead) => {
    if (!lead.phone) {
      toast.error("Lead must have a phone number to convert");
      return;
    }

    try {
      // Create customer
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name || "Unknown",
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
        }),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Update lead as converted
      await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          status: "converted",
          customer_id: data.customer.id,
          converted_at: new Date().toISOString(),
        }),
      });

      toast.success("Lead converted to customer!");
      fetchLeads();
      setShowDetailModal(false);
    } catch {
      toast.error("Failed to convert lead");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/leads?id=${leadId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Lead deleted");
        setLeads(leads.filter(l => l.id !== leadId));
        setShowDetailModal(false);
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads & Funnels</h1>
          <p className="text-gray-400">Manage leads from Instagram, Facebook & more</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/leads/messaging")}
            className="border-gray-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messaging
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-gray-400">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.new || 0}</p>
                <p className="text-xs text-gray-400">New</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Instagram className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.bySource?.instagram || 0}</p>
                <p className="text-xs text-gray-400">Instagram</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Facebook className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.bySource?.facebook || 0}</p>
                <p className="text-xs text-gray-400">Facebook</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.converted || 0}</p>
                <p className="text-xs text-gray-400">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="glass-card border-gray-800">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-gray-400 mb-4">Connect your Instagram & Facebook to start capturing leads</p>
            <Button onClick={() => router.push("/admin/settings?tab=integrations")}>
              Connect Social Accounts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => {
            const SourceIcon = sourceConfig[lead.source]?.icon || Globe;
            return (
              <Card
                key={lead.id}
                className="glass-card border-gray-800 hover:border-gray-700 cursor-pointer transition-all"
                onClick={() => {
                  setSelectedLead(lead);
                  setShowDetailModal(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {lead.profile_picture_url ? (
                          <img
                            src={lead.profile_picture_url}
                            alt={lead.name || ""}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-gray-900 ${sourceConfig[lead.source]?.color}`}>
                          <SourceIcon className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {lead.name || lead.platform_username || "Unknown"}
                          </p>
                          {lead.platform_username && lead.name && (
                            <span className="text-sm text-gray-500">@{lead.platform_username}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`border-0 ${statusConfig[lead.status]?.color}`}>
                        {statusConfig[lead.status]?.label || lead.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString("en-IN")}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lead.id, "contacted");
                          }}>
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lead.id, "interested");
                          }}>
                            Mark Interested
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToCustomer(lead);
                          }}>
                            Convert to Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                            className="text-red-400"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="glass-card border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="Lead name"
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={newLead.source}
                onValueChange={(val) => setNewLead({ ...newLead, source: val })}
              >
                <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                placeholder="Additional notes..."
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLead}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="glass-card border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selectedLead.profile_picture_url ? (
                  <img
                    src={selectedLead.profile_picture_url}
                    alt={selectedLead.name || ""}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold">
                    {selectedLead.name || selectedLead.platform_username || "Unknown"}
                  </p>
                  {selectedLead.platform_username && (
                    <p className="text-sm text-gray-400">@{selectedLead.platform_username}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`border-0 text-xs ${sourceConfig[selectedLead.source]?.color}`}>
                      {sourceConfig[selectedLead.source]?.label || selectedLead.source}
                    </Badge>
                    <Badge className={`border-0 text-xs ${statusConfig[selectedLead.status]?.color}`}>
                      {statusConfig[selectedLead.status]?.label || selectedLead.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="glass-card rounded-xl p-4 space-y-2">
                {selectedLead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedLead.phone}</span>
                  </div>
                )}
                {selectedLead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedLead.email}</span>
                  </div>
                )}
                {selectedLead.source_campaign && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">{selectedLead.source_campaign}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-sm text-gray-400">{selectedLead.notes}</p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <Label>Update Status</Label>
                <Select
                  value={selectedLead.status}
                  onValueChange={(val) => handleUpdateStatus(selectedLead.id, val)}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedLead.status !== "converted" && (
                  <Button
                    onClick={() => handleConvertToCustomer(selectedLead)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convert to Customer
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="border-red-800 text-red-400 hover:bg-red-900/20"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <LeadsPageContent />
    </Suspense>
  );
}

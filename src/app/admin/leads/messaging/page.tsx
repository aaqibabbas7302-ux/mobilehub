"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Plus,
  Instagram,
  Facebook,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Users,
  FileText,
  Play,
  Pause,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MessageTemplate {
  id: string;
  name: string;
  platform: string;
  content: string;
  variables: string[];
  category: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  template_id: string | null;
  message_content: string;
  target_audience: string;
  target_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  status: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  message_templates?: { name: string; content: string };
}

const platformConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500 bg-pink-500/20" },
  facebook: { label: "Facebook", icon: Facebook, color: "text-blue-500 bg-blue-500/20" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-green-500 bg-green-500/20" },
  all: { label: "All Platforms", icon: MessageCircle, color: "text-purple-500 bg-purple-500/20" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400", icon: Edit },
  scheduled: { label: "Scheduled", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  sending: { label: "Sending", color: "bg-blue-500/20 text-blue-400", icon: Send },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

function MessagingPageContent() {
  const router = useRouter();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Template form
  const [templateForm, setTemplateForm] = useState({
    id: "",
    name: "",
    platform: "all",
    content: "",
    category: "custom",
  });

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    platform: "instagram",
    template_id: "",
    message_content: "",
    target_audience: "all_followers",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, campaignsRes] = await Promise.all([
        fetch("/api/messages/templates"),
        fetch("/api/messages/campaigns"),
      ]);

      const templatesData = await templatesRes.json();
      const campaignsData = await campaignsRes.json();

      setTemplates(templatesData.templates || []);
      setCampaigns(campaignsData.campaigns || []);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      toast.error("Name and content are required");
      return;
    }

    setSaving(true);
    try {
      const method = templateForm.id ? "PUT" : "POST";
      const res = await fetch("/api/messages/templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(templateForm.id ? "Template updated" : "Template created");
        setShowTemplateModal(false);
        setTemplateForm({ id: "", name: "", platform: "all", content: "", category: "custom" });
        fetchData();
      }
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      const res = await fetch(`/api/messages/templates?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Template deleted");
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.message_content) {
      toast.error("Name and message content are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/messages/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Campaign created");
        setShowCampaignModal(false);
        setCampaignForm({
          name: "",
          platform: "instagram",
          template_id: "",
          message_content: "",
          target_audience: "all_followers",
        });
        fetchData();
      }
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleCampaignAction = async (id: string, action: "start" | "cancel") => {
    try {
      const res = await fetch("/api/messages/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        fetchData();
      }
    } catch {
      toast.error("Failed to update campaign");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;

    try {
      const res = await fetch(`/api/messages/campaigns?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Campaign deleted");
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  const selectTemplate = (template: MessageTemplate) => {
    setCampaignForm({
      ...campaignForm,
      template_id: template.id,
      message_content: template.content,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/leads")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Messaging</h1>
            <p className="text-gray-400">Send bulk messages to leads & followers</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="campaigns">
            <Send className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Message Campaigns</h2>
            <Button onClick={() => setShowCampaignModal(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="glass-card border-gray-800">
              <CardContent className="py-16 text-center">
                <Send className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-gray-400 mb-4">Create your first message campaign</p>
                <Button onClick={() => setShowCampaignModal(true)}>
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => {
                const PlatformIcon = platformConfig[campaign.platform]?.icon || MessageCircle;
                const StatusIcon = statusConfig[campaign.status]?.icon || Clock;
                return (
                  <Card key={campaign.id} className="glass-card border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${platformConfig[campaign.platform]?.color}`}>
                            <PlatformIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-1 max-w-md">
                              {campaign.message_content}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-semibold">{campaign.target_count}</p>
                              <p className="text-xs text-gray-500">Target</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-green-400">{campaign.sent_count}</p>
                              <p className="text-xs text-gray-500">Sent</p>
                            </div>
                            {campaign.failed_count > 0 && (
                              <div className="text-center">
                                <p className="font-semibold text-red-400">{campaign.failed_count}</p>
                                <p className="text-xs text-gray-500">Failed</p>
                              </div>
                            )}
                          </div>

                          <Badge className={`border-0 ${statusConfig[campaign.status]?.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[campaign.status]?.label}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {campaign.status === "draft" && (
                                <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, "start")}>
                                  <Play className="w-4 h-4 mr-2" /> Start Campaign
                                </DropdownMenuItem>
                              )}
                              {campaign.status === "sending" && (
                                <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, "cancel")}>
                                  <Pause className="w-4 h-4 mr-2" /> Cancel
                                </DropdownMenuItem>
                              )}
                              {["draft", "cancelled"].includes(campaign.status) && (
                                <DropdownMenuItem onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              )}
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
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Message Templates</h2>
            <Button onClick={() => setShowTemplateModal(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const PlatformIcon = platformConfig[template.platform]?.icon || MessageCircle;
                return (
                  <Card key={template.id} className="glass-card border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${platformConfig[template.platform]?.color}`}>
                            <PlatformIcon className="w-4 h-4" />
                          </div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setTemplateForm({
                                id: template.id,
                                name: template.name,
                                platform: template.platform,
                                content: template.content,
                                category: template.category,
                              });
                              setShowTemplateModal(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 line-clamp-3">{template.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="border-gray-700 text-xs">
                          {template.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Used {template.usage_count} times
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="glass-card border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>{templateForm.id ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="Template name"
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={templateForm.platform}
                  onValueChange={(val) => setTemplateForm({ ...templateForm, platform: val })}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(val) => setTemplateForm({ ...templateForm, category: val })}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message Content</Label>
              <Textarea
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                placeholder="Hi {{name}}! Thanks for following us..."
                className="mt-1 bg-gray-900 border-gray-700 min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {"{{name}}"}, {"{{phone_model}}"} for variables
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateForm({ id: "", name: "", platform: "all", content: "", category: "custom" });
                }}
                className="flex-1 border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="glass-card border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="e.g., New Year Sale 2026"
                className="mt-1 bg-gray-900 border-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={campaignForm.platform}
                  onValueChange={(val) => setCampaignForm({ ...campaignForm, platform: val })}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={campaignForm.target_audience}
                  onValueChange={(val) => setCampaignForm({ ...campaignForm, target_audience: val })}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_followers">All Followers</SelectItem>
                    <SelectItem value="new_leads">New Leads Only</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template Selection */}
            {templates.length > 0 && (
              <div>
                <Label>Use Template (optional)</Label>
                <Select
                  value={campaignForm.template_id}
                  onValueChange={(val) => {
                    const template = templates.find(t => t.id === val);
                    if (template) selectTemplate(template);
                  }}
                >
                  <SelectTrigger className="mt-1 bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Message Content</Label>
              <Textarea
                value={campaignForm.message_content}
                onChange={(e) => setCampaignForm({ ...campaignForm, message_content: e.target.value })}
                placeholder="Write your message here..."
                className="mt-1 bg-gray-900 border-gray-700 min-h-[120px]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCampaignModal(false)}
                className="flex-1 border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <MessagingPageContent />
    </Suspense>
  );
}

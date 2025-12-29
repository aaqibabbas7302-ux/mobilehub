"use client";

import Link from "next/link";
import { 
  Phone, 
  MessageCircle, 
  Users, 
  Award, 
  Shield, 
  Zap,
  Heart,
  Target,
  CheckCircle2,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWhatsAppLink } from "@/lib/utils";

const WHATSAPP_NUMBER = "919910724940";

const stats = [
  { value: "15,000+", label: "Phones Sold", icon: Phone },
  { value: "12,500+", label: "Happy Customers", icon: Users },
  { value: "8+", label: "Years Experience", icon: Calendar },
  { value: "< 2%", label: "Return Rate", icon: TrendingUp },
];

const values = [
  {
    icon: Shield,
    title: "Quality First",
    description: "Every phone goes through our rigorous 50+ point quality check before listing.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Heart,
    title: "Customer Obsessed",
    description: "Your satisfaction is our priority. We go above and beyond to ensure you're happy.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Same-day delivery in Delhi NCR. Quick responses on WhatsApp 24/7.",
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    icon: Target,
    title: "Best Prices",
    description: "We guarantee the best prices in Delhi or we'll match any competitor's price.",
    gradient: "from-blue-500 to-cyan-600",
  },
];

const team = [
  { name: "Rajesh Kumar", role: "Founder & CEO", emoji: "👨‍💼", experience: "15+ years in mobile industry" },
  { name: "Priya Sharma", role: "Operations Head", emoji: "👩‍💻", experience: "Customer experience expert" },
  { name: "Amit Singh", role: "Tech Lead", emoji: "👨‍🔧", experience: "Device quality specialist" },
  { name: "Neha Gupta", role: "Sales Manager", emoji: "👩‍💼", experience: "10+ years sales experience" },
];

const milestones = [
  { year: "2016", title: "Started Operations", description: "Opened our first shop in Gaffar Market" },
  { year: "2018", title: "1000 Phones Sold", description: "Reached our first major milestone" },
  { year: "2020", title: "Went Digital", description: "Launched WhatsApp support & online presence" },
  { year: "2023", title: "AI Integration", description: "Introduced AI-powered customer support" },
  { year: "2024", title: "15,000+ Phones", description: "Became Delhi's #1 pre-owned phone store" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="orb orb-cyan w-[500px] h-[500px] -top-48 -right-48" />
        <div className="orb orb-orange w-[400px] h-[400px] bottom-20 -left-48" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Mobile<span className="text-orange-500">Hub</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/phones" className="text-gray-400 hover:text-white transition-colors">All Phones</Link>
            <Link href="/brands" className="text-gray-400 hover:text-white transition-colors">Brands</Link>
            <Link href="/about" className="text-orange-500 font-medium">About</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </nav>

          <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
            <Button className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Since 2016
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Delhi&apos;s Most
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Trusted
              </span>
              Phone Store
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We&apos;re on a mission to make premium smartphones accessible to everyone. 
              Quality certified, warranty included, prices you&apos;ll love.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center card-hover-effect">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-orange-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 mb-4">
                Our Story
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Started with a Simple <span className="text-orange-500">Vision</span>
              </h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  In 2016, our founder Rajesh Kumar noticed a gap in the market. People wanted 
                  quality phones but couldn&apos;t always afford brand new devices. The pre-owned 
                  market existed, but it was plagued by trust issues.
                </p>
                <p>
                  We set out to change that. Starting from a small shop in Gaffar Market, 
                  Karol Bagh, we built MobileHub on three pillars: <span className="text-white">Quality</span>, 
                  <span className="text-white"> Transparency</span>, and <span className="text-white">Trust</span>.
                </p>
                <p>
                  Today, we&apos;re proud to be Delhi&apos;s most trusted pre-owned phone destination, 
                  having served over 12,500 happy customers and counting.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="gradient-border rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">🏪</div>
                    <p className="font-semibold">Gaffar Market</p>
                    <p className="text-xs text-gray-500">Our Home Since 2016</p>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">🤝</div>
                    <p className="font-semibold">Customer First</p>
                    <p className="text-xs text-gray-500">Always & Forever</p>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="font-semibold">50+ Point Check</p>
                    <p className="text-xs text-gray-500">Quality Assured</p>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">🛡️</div>
                    <p className="font-semibold">6-Month Warranty</p>
                    <p className="text-xs text-gray-500">Peace of Mind</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 mb-4">
              What We Stand For
            </Badge>
            <h2 className="text-4xl font-bold">Our <span className="text-orange-500">Values</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 card-hover-effect">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 mb-4">
              Our Journey
            </Badge>
            <h2 className="text-4xl font-bold">Key <span className="text-orange-500">Milestones</span></h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-purple-500 to-cyan-500" />
              
              {milestones.map((milestone, i) => (
                <div key={i} className="relative flex gap-6 pb-12 last:pb-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold z-10 flex-shrink-0">
                    {milestone.year}
                  </div>
                  <div className="glass-card rounded-2xl p-6 flex-1">
                    <h3 className="text-xl font-bold mb-1">{milestone.title}</h3>
                    <p className="text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/30 mb-4">
              The People Behind
            </Badge>
            <h2 className="text-4xl font-bold">Our <span className="text-orange-500">Team</span></h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center card-hover-effect">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl">
                  {member.emoji}
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-orange-500 text-sm">{member.role}</p>
                <p className="text-gray-500 text-xs mt-2">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            <div className="relative px-8 py-16 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Visit our store or message us on WhatsApp. Let us help you find your perfect phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-2xl">
                    <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                    Chat Now
                  </Button>
                </a>
                <Link href="/contact">
                  <Button variant="outline" className="border-white/30 bg-transparent hover:bg-white/10 text-white text-lg px-8 py-6 rounded-2xl">
                    <MapPin className="w-5 h-5 mr-2" />
                    Visit Store
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">© 2024 MobileHub Delhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

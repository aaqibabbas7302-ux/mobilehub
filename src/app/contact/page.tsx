"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Navigation,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getWhatsAppLink } from "@/lib/utils";

const WHATSAPP_NUMBER = "919910724940";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+91 99107 24940",
    description: "Fastest response • Available 24/7",
    action: getWhatsAppLink(WHATSAPP_NUMBER),
    gradient: "from-green-500 to-emerald-600",
    recommended: true,
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 99107 24940",
    description: "Call us directly • 10 AM - 9 PM",
    action: "tel:+919910724940",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@mobilehub.in",
    description: "For business inquiries",
    action: "mailto:hello@mobilehub.in",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "Gaffar Market, Karol Bagh",
    description: "New Delhi - 110005",
    action: "https://maps.google.com/?q=Gaffar+Market+Karol+Bagh+Delhi",
    gradient: "from-orange-500 to-red-600",
  },
];

const faqs = [
  {
    question: "Do you provide warranty on second-hand phones?",
    answer: "Yes! We provide a 6-month warranty on all phones. This covers manufacturing defects and hardware issues. We also offer an extended warranty option for up to 12 months.",
  },
  {
    question: "Can I check the phone before buying?",
    answer: "Absolutely! We encourage you to visit our store in Gaffar Market and test the phone thoroughly. You can also video call us on WhatsApp for a live demo before purchase.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods including UPI (PhonePe, Google Pay, Paytm), bank transfer, credit/debit cards, and cash. EMI options are also available on select phones.",
  },
  {
    question: "Do you buy old phones?",
    answer: "Yes! We offer competitive prices for your old phones. Send us photos and details on WhatsApp for an instant quote. We also have exchange offers for upgrading your phone.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy. If you're not satisfied with your purchase, you can return it within 7 days for a full refund or exchange (terms apply).",
  },
  {
    question: "Do you deliver outside Delhi?",
    answer: "Yes! We deliver across India. Shipping is free for orders above ₹25,000. For orders below that, a nominal shipping charge applies based on your location.",
  },
];

const businessHours = [
  { day: "Monday - Saturday", time: "10:00 AM - 9:00 PM" },
  { day: "Sunday", time: "11:00 AM - 7:00 PM" },
  { day: "Public Holidays", time: "Closed" },
];

export default function ContactPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open WhatsApp with the form data
    const message = `Hi! I'm ${formData.name}.%0A%0A${formData.message}%0A%0AContact: ${formData.phone}%0AEmail: ${formData.email}`;
    window.open(getWhatsAppLink(WHATSAPP_NUMBER, message), "_blank");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48" />
        <div className="orb orb-cyan w-[400px] h-[400px] bottom-20 -right-48" />
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
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-orange-500 font-medium">Contact</Link>
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
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            We&apos;re Here to Help
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Get in <span className="text-orange-500">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question? Want to buy a phone? Or just want to say hi? 
            We&apos;d love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, i) => (
              <a
                key={i}
                href={method.action}
                target={method.action.startsWith("http") ? "_blank" : undefined}
                rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <div className="glass-card rounded-2xl p-6 card-hover-effect h-full relative">
                  {method.recommended && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-0 text-xs">
                      Recommended
                    </Badge>
                  )}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4`}>
                    <method.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{method.title}</h3>
                  <p className="text-orange-500 font-medium">{method.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{method.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Your Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="I'm interested in buying a phone..."
                    className="bg-white/5 border-gray-800 rounded-xl min-h-[150px] resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-futuristic bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 rounded-xl border-0 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send via WhatsApp
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Your message will be sent to our WhatsApp for faster response
                </p>
              </form>
            </div>

            {/* Store Info & Map */}
            <div className="space-y-6">
              {/* Store Details */}
              <div className="glass-card rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Visit Our Store</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold">MobileHub Delhi</p>
                      <p className="text-gray-400 text-sm">
                        Shop 42, Gaffar Market<br />
                        Karol Bagh, New Delhi - 110005
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <div className="text-sm text-gray-400 space-y-1 mt-1">
                        {businessHours.map((item, i) => (
                          <div key={i} className="flex justify-between gap-4">
                            <span>{item.day}</span>
                            <span className={item.time === "Closed" ? "text-red-400" : "text-green-400"}>
                              {item.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <a 
                  href="https://maps.google.com/?q=Gaffar+Market+Karol+Bagh+Delhi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-white/5 hover:bg-white/10 border-0 py-6 rounded-xl">
                    <Navigation className="w-5 h-5 mr-2 text-blue-500" />
                    Get Directions
                  </Button>
                </a>
              </div>

              {/* Map */}
              <div className="glass-card rounded-3xl overflow-hidden h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.5234!2d77.1892!3d28.6442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d029f6c6a6c7d%3A0x123456789!2sGaffar%20Market%2C%20Karol%20Bagh%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Social Links */}
              <div className="glass-card rounded-2xl p-6">
                <p className="font-semibold mb-4">Follow Us</p>
                <div className="flex gap-4">
                  {[
                    { icon: Instagram, label: "Instagram", color: "hover:bg-pink-500/20 hover:text-pink-500" },
                    { icon: Facebook, label: "Facebook", color: "hover:bg-blue-500/20 hover:text-blue-500" },
                    { icon: Youtube, label: "YouTube", color: "hover:bg-red-500/20 hover:text-red-500" },
                  ].map((social, i) => (
                    <button
                      key={i}
                      className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 transition-all ${social.color}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 mb-4">
              Got Questions?
            </Badge>
            <h2 className="text-4xl font-bold">
              Frequently Asked <span className="text-orange-500">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
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

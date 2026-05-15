"use client";

import React, { useState } from "react";
import { 
  Star, 
  MessageSquare, 
  Clock, 
  Flag, 
  ThumbsUp, 
  TrendingUp, 
  Smile, 
  Frown, 
  Meh, 
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

// --- Types ---

type ReviewStatus = "pending" | "awaiting_response" | "scheduled" | "published" | "flagged";

interface Review {
  id: string;
  guestName: string;
  rating: number;
  text: string;
  date: string;
  property: string;
  room: string;
  mealPlan: string;
  status: ReviewStatus;
  autoPublishDays: number;
  tags: string[];
  ratings: {
    cleanliness: number;
    food: number;
    service: number;
    comfort: number;
  };
}

// --- Mock Data ---

const REVIEWS: Review[] = [
  {
    id: "R-88201",
    guestName: "Ananya Sharma",
    rating: 5,
    text: "The Royal Heritage Suite exceeded all expectations. The sunset views from the balcony were breathtaking, and the staff's attention to detail was impeccable. Special thanks to the housekeeping team!",
    date: "2 days ago",
    property: "Grand Heritage Resort",
    room: "Royal Heritage Suite",
    mealPlan: "MAP",
    status: "published",
    autoPublishDays: 0,
    tags: ["Excellent Service", "Cleanliness", "Breathtaking Views"],
    ratings: { cleanliness: 5, food: 5, service: 5, comfort: 5 }
  },
  {
    id: "R-88205",
    guestName: "Rohan Malhotra",
    rating: 4,
    text: "Beautiful property and very polite staff. However, the private pool temperature was a bit lower than expected. The food at the rooftop restaurant was delicious.",
    date: "5 days ago",
    property: "Sunset Private Villa",
    room: "Private Pool Villa",
    mealPlan: "CP",
    status: "awaiting_response",
    autoPublishDays: 10,
    tags: ["Polite Staff", "Great Food"],
    ratings: { cleanliness: 5, food: 5, service: 4, comfort: 4 }
  },
  {
    id: "R-88198",
    guestName: "Siddharth Verma",
    rating: 3,
    text: "The room was spotless, but there was significant noise from the nearby construction throughout the day. It made it difficult to relax in the garden.",
    date: "12 days ago",
    property: "Grand Heritage Resort",
    room: "Premium Garden Room",
    mealPlan: "EP",
    status: "pending",
    autoPublishDays: 3,
    tags: ["Noisy", "Clean Room"],
    ratings: { cleanliness: 5, food: 4, service: 3, comfort: 2 }
  }
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: ReviewStatus | "default" }) => {
  const variants: Record<string, string> = {
    published: "bg-[#159665]/10 text-[#159665]",
    awaiting_response: "bg-[#FCBC43]/10 text-[#FCBC43]",
    pending: "bg-gray-500/10 text-gray-500",
    flagged: "bg-[#F24633]/10 text-[#F24633]",
    scheduled: "bg-[#0983B0]/10 text-[#0983B0]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", variants[variant] || "bg-[#0E5A75]/10 text-[#0E5A75]")}>
      {children ? children.toString().replace('_', ' ') : ''}
    </span>
  );
};

// --- Main Page ---

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("all");

  const filteredReviews = activeTab === "all" 
    ? REVIEWS 
    : REVIEWS.filter(r => r.status === activeTab);

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Reputation Management</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Guest Reviews</h1>
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-[24px] border border-black/5 dark:border-white/5 backdrop-blur-xl">
          <StatMini label="Avg Rating" value="4.8" icon={Star} color="text-[#FCBC43]" />
          <div className="w-px h-10 bg-black/5 dark:bg-white/5" />
          <StatMini label="Response Rate" value="96%" icon={MessageSquare} color="text-[#159665]" />
          <div className="w-px h-10 bg-black/5 dark:bg-white/5" />
          <StatMini label="Pending" value="08" icon={Clock} color="text-[#0983B0]" />
        </div>
      </div>

      {/* 2. Rating Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="lg:col-span-3 p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#159665]" /> Rating Trends
            </h3>
            <select className="bg-transparent text-xs font-bold uppercase tracking-widest text-[#0E5A75] outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricBar label="Cleanliness" value={4.9} />
            <MetricBar label="Staff Service" value={4.8} />
            <MetricBar label="Food Quality" value={4.6} />
            <MetricBar label="Value for Money" value={4.7} />
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center text-center p-8 bg-[#0E5A75] text-white">
          <div className="relative mb-4">
            <Star size={48} className="fill-white/20 text-white" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black">4.8</span>
          </div>
          <h4 className="text-lg font-black tracking-tight leading-tight mb-2">Hospitality Score</h4>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-relaxed">Top 5% of properties in Udaipur</p>
          <div className="mt-6 flex gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={12} className={cn("fill-current", i <= 4 ? "text-white" : "text-white/20")} />)}
          </div>
        </GlassCard>
      </div>

      {/* 3. Review List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Filter Tabs */}
        <aside className="lg:col-span-1 space-y-2">
          <FilterTab label="All Reviews" count={124} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
          <FilterTab label="Pending Response" count={8} active={activeTab === "awaiting_response"} onClick={() => setActiveTab("awaiting_response")} />
          <FilterTab label="Scheduled" count={3} active={activeTab === "scheduled"} onClick={() => setActiveTab("scheduled")} />
          <FilterTab label="Published" count={112} active={activeTab === "published"} onClick={() => setActiveTab("published")} />
          <FilterTab label="Flagged" count={1} active={activeTab === "flagged"} onClick={() => setActiveTab("flagged")} />
          
          <div className="pt-6">
            <GlassCard className="p-5 border-dashed bg-transparent">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/40 mb-3">Sentiment Analysis</h4>
              <div className="space-y-3">
                <SentimentMini icon={Smile} label="Positive" percentage={88} color="bg-[#159665]" />
                <SentimentMini icon={Meh} label="Neutral" percentage={8} color="bg-[#FCBC43]" />
                <SentimentMini icon={Frown} label="Negative" percentage={4} color="bg-[#F24633]" />
              </div>
            </GlassCard>
          </div>
        </aside>

        {/* Right: Review Cards / Empty State */}
        <div className="lg:col-span-3 space-y-6">
          {filteredReviews.length > 0 ? (
            <>
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <button className="w-full py-5 rounded-[24px] border-2 border-dashed border-[#0E5A75]/10 text-[#0E5A75]/40 font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 transition-all">
                Explore Complete Guest Archives
              </button>
            </>
          ) : (
            <EmptyState 
              icon={Star}
              title="Awaiting Guest Stories"
              description="No feedback matches this curated segment. Once guests share their stay memories, they will populate dynamically here."
              actionLabel="Reset View"
              onAction={() => setActiveTab("all")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatMini({ label, value, icon: Icon, color }: { label: string, value: string, icon: LucideIcon, color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Icon size={18} className={color} />
      <div>
        <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-black text-[#053344] dark:text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60">{label}</span>
        <span className="text-sm font-black text-[#053344] dark:text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-[#0E5A75]/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#0E5A75] rounded-full shadow-lg" 
          style={{ width: `${(value / 5) * 100}%` }} 
        />
      </div>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }: { label: string, count: number, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group",
        active 
          ? "bg-[#0E5A75] text-white shadow-lg shadow-[#0E5A75]/20" 
          : "text-[#0E5A75] hover:bg-[#0E5A75]/5"
      )}
    >
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-lg text-[9px] font-black",
        active ? "bg-white/20 text-white" : "bg-[#0E5A75]/10 text-[#0E5A75]"
      )}>
        {count}
      </span>
    </button>
  );
}

function SentimentMini({ icon: Icon, label, percentage, color }: { icon: LucideIcon, label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
        <div className="flex items-center gap-1">
          <Icon size={10} className={color.replace('bg-', 'text-')} />
          <span>{label}</span>
        </div>
        <span>{percentage}%</span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-lg shadow-lg">
              {review.guestName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#053344] dark:text-white leading-tight">{review.guestName}</h3>
              <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mt-1">
                Stayed: {review.room} • {review.date}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={cn("fill-current", i <= review.rating ? "text-[#FCBC43]" : "text-[#0E5A75]/10")} />
              ))}
            </div>
            <Badge variant={review.status}>{review.status}</Badge>
          </div>
        </div>

        <p className="text-sm font-medium text-[#053344] dark:text-white leading-relaxed italic border-l-4 border-[#0E5A75]/10 pl-4 py-1">
          &ldquo;{review.text}&rdquo;
        </p>

        <div className="flex flex-wrap gap-2">
          {review.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-lg bg-[#0E5A75]/5 text-[#0E5A75] text-[9px] font-black uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>

        {/* 15-day Auto Publish Countdown */}
        {review.status === "pending" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FCBC43]/10 border border-[#FCBC43]/20">
            <Clock size={14} className="text-[#FCBC43]" />
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#FCBC43]">
              Auto publishes in {review.autoPublishDays} days
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 hover:text-[#0E5A75] transition-all">
            <ThumbsUp size={14} /> Helpful
          </button>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 hover:text-[#F24633] transition-all">
            <Flag size={14} /> Flag
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {review.status === "awaiting_response" ? (
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">
              <MessageSquare size={14} /> Response to Guest
            </button>
          ) : (
            <button className="px-6 py-2.5 rounded-xl border border-[#0E5A75]/20 text-[#0E5A75] text-[10px] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
              View Conversation
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

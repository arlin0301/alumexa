import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="border-b border-surface-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-brand-700" />
            <span className="text-lg font-bold text-slate-800">Alumexa</span>
          </div>
          <Link to="/login" className="btn-secondary">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          A verified, connected
          <span className="text-brand-700"> alumni network</span> for your college
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          Alumexa centralizes alumni registration, staff-verified profiles, and student
          discovery — so your institution always has an accurate, searchable record of
          where its graduates are today.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register/alumni" className="btn-accent text-base px-6 py-3">
            I'm an Alumnus — Register
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/register/student" className="btn-primary text-base px-6 py-3">
            I'm a Student — Register
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={ShieldCheck}
          title="Verified Records"
          description="Every alumni profile is reviewed and approved by a department staff admin before it appears in the directory."
        />
        <FeatureCard
          icon={Users}
          title="Mentor Discovery"
          description="Students can search the verified alumni directory by department, batch, career status, and mentorship availability."
        />
        <FeatureCard
          icon={BarChart3}
          title="Institution Analytics"
          description="Admins get a live view of alumni distribution across departments, batches, and career paths — with one-click exports."
        />
      </section>

      <footer className="border-t border-surface-200 py-6 text-center text-sm text-slate-400">
        Alumexa — Alumni Registry & Verification Platform
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="card">
      <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-700 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Sparkles, Linkedin, Globe, Link2, Search } from 'lucide-react';
import api from '../../utils/api';

const STATUS_LABELS = {
  WORKING: 'Working', HIGHER_EDUCATION: 'Higher Education', EXAM_PREPARATION: 'Exam Preparation', OTHERS: 'Others',
};

export default function MentorMatch() {
  const [careerInterest, setCareerInterest] = useState('');
  const [department, setDepartment] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    api.get('/student/me')
      .then(({ data }) => {
        setCareerInterest(data.careerInterest || '');
        setDepartment(data.department);
      })
      .finally(() => setInitialLoad(false));
  }, []);

  async function findMentors(e) {
    e?.preventDefault();
    setLoading(true);
    setSaving(true);
    try {
      // Save the career interest to the student's profile, then fetch matches
      await api.patch('/student/me', { careerInterest });
      const { data } = await api.get('/student/mentor-matches', { params: { careerInterest } });
      setMatches(data.matches);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  if (initialLoad) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent-500" /> Smart Mentor Match
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell us what you're interested in, and we'll suggest verified alumni mentors based on
          your department and career interests.
        </p>
      </div>

      <form onSubmit={findMentors} className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Your Department</label>
            <input className="input-field bg-surface-50" value={department?.name || '—'} disabled />
          </div>
          <div>
            <label className="label-text">Career Interest</label>
            <input
              className="input-field"
              placeholder="e.g. Software Engineering, Data Science, Government Exams"
              value={careerInterest}
              onChange={(e) => setCareerInterest(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-accent">
          <Search className="h-4 w-4" /> {loading ? 'Finding mentors…' : 'Find My Mentors'}
        </button>
      </form>

      {matches !== null && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">
            {matches.length === 0 ? 'No matches found' : `Top ${matches.length} Suggested Mentor${matches.length !== 1 ? 's' : ''}`}
          </h2>

          {matches.length === 0 ? (
            <div className="card text-center py-10">
              <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                We couldn't find a strong match yet. Try a different career interest, or check back
                once more alumni have been verified.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m) => (
                <div key={m.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{m.fullName}</h3>
                      <p className="text-xs text-slate-500">{m.department?.name} · Batch {m.batch}</p>
                    </div>
                    {m.mentorAvailable && (
                      <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sparkles className="h-3 w-3" /> Mentor
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    {STATUS_LABELS[m.currentStatus]}
                    {m.organizationName && ` · ${m.designation} at ${m.organizationName}`}
                    {m.institutionName && ` · ${m.degreePursuing} at ${m.institutionName}`}
                    {m.examName && ` · ${m.examName}`}
                    {m.activityName && ` · ${m.activityName}`}
                  </p>

                  {m.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="text-xs rounded-full bg-surface-100 text-slate-600 px-2.5 py-1">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-surface-200 pt-3 mb-3">
                    <p className="text-xs text-slate-400 mb-1.5">Why this match?</p>
                    <ul className="space-y-1">
                      {m.matchReasons.map((r, i) => (
                        <li key={i} className="text-xs text-brand-700 flex items-start gap-1.5">
                          <span className="mt-0.5">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(m.linkedin || m.portfolio || m.website) && (
                    <div className="flex flex-wrap gap-3">
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a>}
                      {m.portfolio && <a href={m.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"><Link2 className="h-3.5 w-3.5" /> Portfolio</a>}
                      {m.website && <a href={m.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"><Globe className="h-3.5 w-3.5" /> Website</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

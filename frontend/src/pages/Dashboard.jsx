import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Copy,
  Link2,
  Clock,
  Bold,
  Italic,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../api/index.js";

const DURATIONS = [15, 30, 45, 60, 90, 120];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function EventTypeModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    duration: event?.duration || 15,
    slug: event?.slug || "",
    location: event?.location || "Google Meet",
    bufferTime: event?.bufferTime || 0,
    customQuestions: event?.customQuestions || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "bufferTime" ? Number(value) : value,
      ...(name === "title" && !event ? { slug: slugify(value) } : {}),
    }));
  };

  const handleQuestionsChange = (idx, value) => {
    setForm(prev => {
      const q = [...prev.customQuestions];
      q[idx] = value;
      return { ...prev, customQuestions: q };
    });
  };
  const addQuestion = () => setForm(prev => ({...prev, customQuestions: [...prev.customQuestions, ""]}));
  const removeQuestion = (idx) => setForm(prev => ({...prev, customQuestions: prev.customQuestions.filter((_, i) => i !== idx)}));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm shadow-xl">
      <div className="w-full max-w-[480px] rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl flex flex-col">
        <div className="p-5 pb-0">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {event ? "Edit event type" : "Add a new event type"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {event
              ? "Adjust the event settings below."
              : "Set up event types to offer different types of meetings."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <label className="block text-sm font-semibold text-[var(--text)]">
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Quick chat"
              required
              className="mt-1.5 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--text)]">
            URL
            <div className="mt-1.5 flex items-center rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] overflow-hidden transition-all focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
              <span className="pl-3 pr-1 py-2 text-sm text-[var(--muted)] whitespace-nowrap hidden sm:inline-block">
                https://cal.com/anshika-singh-
              </span>
              <span className="pl-3 pr-1 py-2 text-sm text-[var(--muted)] whitespace-nowrap sm:hidden">
                /
              </span>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="slug"
                required
                className="w-full bg-transparent px-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]/50"
              />
            </div>
          </label>

          <div className="block text-sm font-semibold text-[var(--text)]">
            Description
            <div className="mt-1.5 w-full overflow-hidden rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] transition-all focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
              <div className="flex items-center gap-1 border-b border-[var(--panel-border)] px-2 py-1">
                <button type="button" className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded">
                  <Bold size={14} />
                </button>
                <button type="button" className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded">
                  <Italic size={14} />
                </button>
              </div>
              <textarea
                name="description"
                rows="2"
                value={form.description}
                onChange={handleChange}
                placeholder="A quick video meeting."
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-[var(--text)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-[var(--text)]">
              Duration
              <div className="mt-1.5 relative">
                <select
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {DURATIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <span className="text-sm text-[var(--muted)]">m</span>
                </div>
              </div>
            </label>

            <label className="block text-sm font-semibold text-[var(--text)]">
              Buffer Time
              <div className="mt-1.5 relative">
                <select
                  name="bufferTime"
                  value={form.bufferTime}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {[0, 5, 10, 15, 30, 45, 60].map((t) => (
                    <option key={t} value={t}>{t} m</option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition select-none outline-none">
              + Advanced (Custom Questions)
            </summary>
            <div className="mt-3 block text-sm font-semibold text-[var(--text)] pt-2 border-t border-[var(--panel-border)]">
              Custom Questions
              <div className="mt-2 space-y-2">
                {form.customQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={q}
                      onChange={(e) => handleQuestionsChange(idx, e.target.value)}
                      placeholder="e.g. Phone Number, Company Size"
                      className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addQuestion} className="text-sm text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 mt-2 transition">
                  <Plus size={14} /> Add question
                </button>
              </div>
            </div>
          </details>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--panel-border)] mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--hover)]"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-[var(--panel-bg)] shadow-md transition hover:scale-[0.98] hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  const fetchEventTypes = async () => {
    try {
      const { data } = await getEventTypes();
      setEventTypes(data);
    } catch {
      toast.error("Unable to load event types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleSave = async (form) => {
    try {
      if (modal?.id) {
        await updateEventType(modal.id, form);
        toast.success("Event updated");
      } else {
        await createEventType(form);
        toast.success("Event created");
      }
      setModal(null);
      fetchEventTypes();
    } catch (error) {
      toast.error(error.response?.data?.error || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEventType(id);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchEventTypes();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (eventType) => {
    // Optimistic UI Update so the toggle feels snappy and functional
    setEventTypes((prev) =>
      prev.map((e) =>
        e.id === eventType.id ? { ...e, isActive: !e.isActive } : e
      )
    );
    try {
      await updateEventType(eventType.id, { isActive: !eventType.isActive });
      // Implicitly handled by optimistic update, but can double check:
      // fetchEventTypes(); 
    } catch {
      // Revert if API request actually fails
      setEventTypes((prev) =>
        prev.map((e) =>
          e.id === eventType.id ? { ...e, isActive: !e.isActive } : e
        )
      );
      toast.error("Unable to update status");
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/booking/${slug}`);
    toast.success("Link copied");
  };

  const filteredEventTypes = eventTypes.filter((eventType) => {
    const query = search.toLowerCase();
    return (
      eventType.title.toLowerCase().includes(query) ||
      eventType.slug.toLowerCase().includes(query) ||
      eventType.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-[var(--text)] pb-12">
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--panel-bg)] rounded-[1.5rem] border border-[var(--panel-border)] p-6 shadow-2xl shadow-black/10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600/10 text-red-500 mb-2">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Delete event type
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Are you sure you want to delete <strong className="text-[var(--text)]">"{deleteTarget.title}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-8 flex gap-3 w-full">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-[var(--panel-border)] bg-[var(--hover)] py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel-border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header matching original structure but modernized */}
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between px-2">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Event types
          </h1>
          <p className="mt-1 text-[var(--muted)] text-sm">
            Configure different events for people to book on your calendar.
          </p>
        </div>
      </section>

      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-2">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--text)] focus:ring-1 focus:ring-[var(--text)]"
          />
        </div>
        <button
          onClick={() => setModal("create")}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-[var(--panel-bg)] shadow-md transition hover:scale-[0.98] hover:opacity-90"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text)] border-t-transparent" />
        </div>
      ) : filteredEventTypes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-bg)] p-12 text-center text-[var(--muted)]">
          <p className="text-lg font-semibold text-[var(--text)]">
            No event types yet
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Create your first event to start sharing your booking page.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-sm overflow-hidden">
          <ul className="divide-y divide-[var(--panel-border)]">
            {filteredEventTypes.map((eventType) => (
              <li
                key={eventType.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-[var(--hover)] transition-colors"
              >
                {/* Left Side: Info */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[15px] font-semibold text-[var(--text)]">
                      {eventType.title}
                    </h2>
                    <span className="text-sm text-[var(--muted)]">
                      /anshika-singh/{eventType.slug}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--hover)] px-2 py-1 text-xs font-medium text-[var(--muted)] border border-[var(--panel-border)]">
                      <Clock size={12} />
                      {eventType.duration}m
                    </span>
                  </div>
                </div>

                {/* Right Side: Actions & Toggle */}
                <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
                  
                  {/* Real visual Switch mapping to the screenshot style */}
                  <div className="flex items-center gap-3">
                    {!eventType.isActive && (
                      <span className="text-sm font-medium text-[var(--muted)] hidden sm:inline-block">
                        Hidden
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggle(eventType)}
                      aria-label="Toggle event visibility"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                        eventType.isActive
                          ? "bg-[var(--text)]"
                          : "bg-[var(--panel-border)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--panel-bg)] shadow ring-0 transition duration-200 ease-in-out ${
                          eventType.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions Group exactly matching Cal.com screenshot */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/booking/${eventType.slug}`,
                          "_blank"
                        )
                      }
                      title="Preview text"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text)] transition hover:bg-[var(--hover)]"
                    >
                      <ExternalLink size={16} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => copyLink(eventType.slug)}
                      title="Copy Link"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text)] transition hover:bg-[var(--hover)]"
                    >
                      <Link2 size={16} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(eventType)}
                      title="More options (Delete)"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text)] transition hover:bg-[var(--hover)]"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modal && (
        <EventTypeModal
          event={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Link2,
  Edit2,
  Trash2,
  AlertTriangle,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../api/index.js";

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
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
    duration: event?.duration || 30,
    slug: event?.slug || "",
    color: event?.color || "#6366f1",
    location: event?.location || "Google Meet",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
      ...(name === "title" && !event ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {event ? "Edit event type" : "New event type"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
              >
                {DURATIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} min
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL slug
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color }))}
                  className={`h-10 w-10 rounded-full border-2 transition ${form.color === color ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
            >
              Save
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

  const fetchEventTypes = async () => {
    try {
      const { data } = await getEventTypes();
      setEventTypes(data);
    } catch (error) {
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
      fetchEventTypes();
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (eventType) => {
    try {
      await updateEventType(eventType.id, { isActive: !eventType.isActive });
      fetchEventTypes();
    } catch {
      toast.error("Unable to update status");
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/booking/${slug}`);
    toast.success("Link copied");
  };

  return (
    <>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete event type
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete "{deleteTarget.title}"? This
                  cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Event types
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Create booking pages that mimic Cal.com behavior.
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
          >
            <Plus size={16} /> New event type
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
            No event types yet. Start by creating one.
          </div>
        ) : (
          <div className="space-y-4">
            {eventTypes.map((eventType) => (
              <div
                key={eventType.id}
                className={`rounded-3xl border bg-white p-5 shadow-sm transition ${eventType.isActive ? "" : "opacity-70"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {eventType.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {eventType.description || "No description provided."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>{eventType.duration} min</span>
                        <span>·</span>
                        <span>{eventType.location}</span>
                        <span>·</span>
                        <Link
                          to={`/booking/${eventType.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-brand hover:underline"
                        >
                          <Link2 size={14} />/{eventType.slug}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => copyLink(eventType.slug)}
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Copy size={14} /> Copy link
                    </button>
                    <button
                      onClick={() => setModal(eventType)}
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggle(eventType)}
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {eventType.isActive ? (
                        <ToggleRight size={14} />
                      ) : (
                        <ToggleLeft size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(eventType)}
                      className="rounded-2xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
    </>
  );
}

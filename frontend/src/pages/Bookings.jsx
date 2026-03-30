import { useEffect, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  getBookings,
  cancelBooking,
  rescheduleBooking,
  getAvailability,
  getBookedSlots,
} from "../api/index.js";
import { Calendar, Clock, X, RefreshCw, Filter, Search } from "lucide-react";

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-yellow-100 text-yellow-700",
};

function RescheduleModal({ booking, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availability, setAvailability] = useState([]);
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    getAvailability()
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setAvailability(data);
        } else {
          setAvailability(data.availabilities || []);
          setOverrides(data.overrides || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!date) return setSlots([]);

    const override = overrides.find((o) => o.date === date);
    let dayAvail;
    if (override) {
      dayAvail = { isAvailable: override.isAvailable, slots: override.slots || [] };
    } else {
      const dayName = dayjs(date).format("dddd");
      dayAvail = availability.find((item) => item.day === dayName);
    }

    if (!dayAvail?.isAvailable) return setSlots([]);

    getBookedSlots(booking.eventTypeId, date)
      .then(({ data }) => {
        const booked = new Set(data.map((item) => item.startTime));
        const generated = [];
        const isToday = dayjs(date).isSame(dayjs(), "day");
        const now = dayjs();
        const buffer = booking.eventType.bufferTime || 0;

        const slotsToProcess = dayAvail.slots || [];
        for (const timeBlock of slotsToProcess) {
          let [hour, minute] = timeBlock.startTime.split(":").map(Number);
          const endMins =
            Number(timeBlock.endTime.split(":")[0]) * 60 +
            Number(timeBlock.endTime.split(":")[1]);

          while (hour * 60 + minute + booking.eventType.duration <= endMins) {
            const slot = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const slotTime = dayjs(`${date}T${slot}`);
            if (!booked.has(slot) && (!isToday || slotTime.isAfter(now))) {
              generated.push(slot);
            }
            minute += booking.eventType.duration + buffer;
            hour += Math.floor(minute / 60);
            minute %= 60;
          }
        }
        setSlots(generated);
      })
      .catch(() => setSlots([]));
  }, [date, booking, availability, overrides]);

  const handleSubmit = () => {
    if (!date || !selectedSlot) {
      toast.error("Select new date and time");
      return;
    }
    const [hour, minute] = selectedSlot.split(":").map(Number);
    const endMinutes = hour * 60 + minute + booking.eventType.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    onConfirm(booking.id, { date, startTime: selectedSlot, endTime });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-gray-900">
          Reschedule booking
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose a new date and time for the booking.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New date
            </label>
            <input
              type="date"
              min={dayjs().format("YYYY-MM-DD")}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedSlot("");
              }}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Available times</p>
            {slots.length ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${selectedSlot === slot ? "border-brand bg-brand text-white" : "border-gray-200 text-gray-700 hover:border-brand hover:text-brand"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No slots available. Choose another day.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getBookings(tab);
      setBookings(data);
    } catch {
      toast.error("Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [tab]);

  const displayed = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.bookerName || "").toLowerCase().includes(q) ||
      (b.bookerEmail || "").toLowerCase().includes(q) ||
      (b.eventType?.title || "").toLowerCase().includes(q) ||
      String(b.id).includes(q)
    );
  });

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleReschedule = async (id, data) => {
    try {
      await rescheduleBooking(id, data);
      toast.success("Booking rescheduled");
      setRescheduleItem(null);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Reschedule failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Bookings</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            See upcoming and past events booked through your event type links.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {["upcoming", "unconfirmed", "recurring", "past", "canceled"].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${tab === value ? "bg-[var(--hover)] text-[var(--text)] border border-[var(--panel-border)]" : "text-[var(--muted)] hover:text-[var(--text)] border border-transparent"}`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border text-[var(--muted)] transition ${filterDropdownOpen ? "border-[var(--text)] bg-[var(--hover)] text-[var(--text)]" : "border-[var(--panel-border)] bg-transparent hover:text-[var(--text)] hover:bg-[var(--hover)]"}`}
            >
              <Filter size={14} /> Filter
            </button>
            
            {filterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-[220px] rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl z-50 overflow-hidden text-sm flex flex-col">
                  <div className="p-2 border-b border-[var(--panel-border)] relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input 
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="w-full pl-8 pr-2 py-1.5 bg-transparent outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-md transition text-[var(--text)]"
                    />
                  </div>
                  <div className="flex flex-col py-1 text-[var(--text)]">
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer">Event Type</button>
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer">Team</button>
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer">Member</button>
                    <button className="flex items-center px-4 py-2 bg-[var(--hover)]/80 transition text-left font-medium cursor-pointer">Attendees Name</button>
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer">Attendee Email</button>
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer text-[var(--muted)]">Date Range</button>
                    <button className="flex items-center px-4 py-2 hover:bg-[var(--hover)] transition text-left cursor-pointer">Booking UID</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand/10 text-brand">
            <Calendar size={28} />
          </div>
          <p className="text-xl font-semibold text-slate-900">
            No {tab} bookings yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Once someone books a meeting, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: booking.eventType?.color || "#6366f1",
                      }}
                    />
                    <span>{booking.eventType?.title}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {booking.bookerName} · {booking.bookerEmail}
                  </p>
                  {booking.customAnswers && Object.keys(booking.customAnswers).length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      {Object.entries(booking.customAnswers).map(([k, v]) => (
                        <div key={k}><strong className="font-semibold text-gray-700">{k}:</strong> {v}</div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={14} />
                      {booking.date}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock size={14} />
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {booking.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => setRescheduleItem(booking)}
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <RefreshCw size={14} /> Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="rounded-2xl border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rescheduleItem && (
        <RescheduleModal
          booking={rescheduleItem}
          onClose={() => setRescheduleItem(null)}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
}

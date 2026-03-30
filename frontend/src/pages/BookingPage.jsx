import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  getEventTypeBySlug,
  getAvailability,
  getBookedSlots,
  createBooking,
} from "../api/index.js";
import {
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [customAnswers, setCustomAnswers] = useState({});
  const [step, setStep] = useState("calendar");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getEventTypeBySlug(slug), getAvailability()])
      .then(([eventRes, availRes]) => {
        setEventType(eventRes.data);
        if (Array.isArray(availRes.data)) {
          setAvailability(availRes.data);
          setOverrides([]);
        } else {
          setAvailability(availRes.data.availabilities || []);
          setOverrides(availRes.data.overrides || []);
        }
      })
      .catch(() => toast.error("Unable to load booking page"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !eventType) return;
    
    const override = overrides.find((o) => o.date === selectedDate);
    let dayAvail;
    if (override) {
      dayAvail = { isAvailable: override.isAvailable, slots: override.slots || [] };
    } else {
      const dayName = dayjs(selectedDate).format("dddd");
      dayAvail = availability.find((item) => item.day === dayName);
    }

    if (!dayAvail?.isAvailable) {
      setSlots([]);
      return;
    }

    getBookedSlots(eventType.id, selectedDate)
      .then(({ data }) => {
        const booked = new Set(data.map((item) => item.startTime));
        const generated = [];
        const isToday = dayjs(selectedDate).isSame(dayjs(), "day");
        const now = dayjs();
        const buffer = eventType.bufferTime || 0;

        const slotsToProcess = dayAvail.slots || [];
        for (const timeBlock of slotsToProcess) {
          let [hour, minute] = timeBlock.startTime.split(":").map(Number);
          const endMinutes =
            Number(timeBlock.endTime.split(":")[0]) * 60 +
            Number(timeBlock.endTime.split(":")[1]);

          while (hour * 60 + minute + eventType.duration <= endMinutes) {
            const slot = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const slotTime = dayjs(`${selectedDate}T${slot}`);
            if (!booked.has(slot) && (!isToday || slotTime.isAfter(now))) {
              generated.push(slot);
            }
            minute += eventType.duration + buffer;
            hour += Math.floor(minute / 60);
            minute %= 60;
          }
        }
        setSlots(generated);
      })
      .catch(() => setSlots([]));
  }, [availability, eventType, selectedDate]);

  const isAvailableDay = (date) => {
    if (date.isBefore(dayjs(), "day")) return false;
    const dateKey = date.format("YYYY-MM-DD");
    const override = overrides.find((o) => o.date === dateKey);
    if (override) return override.isAvailable;
    
    if (!availability.length) return false;
    const dayName = date.format("dddd");
    return availability.some(
      (item) => item.day === dayName && item.isAvailable,
    );
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSlot) {
      toast.error("Pick a time slot");
      return;
    }
    setSubmitting(true);
    try {
      const [hour, minute] = selectedSlot.split(":").map(Number);
      const endMinutes = hour * 60 + minute + eventType.duration;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
      const response = await createBooking({
        eventTypeId: eventType.id,
        bookerName: form.name,
        bookerEmail: form.email,
        notes: form.notes,
        customAnswers,
        date: selectedDate,
        startTime: selectedSlot,
        endTime,
      });
      const confirmData = { booking: response.data, eventType };
      sessionStorage.setItem("bookingConfirm", JSON.stringify(confirmData));
      navigate("/booking-confirmed", {
        state: confirmData,
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-center text-[var(--muted)]">
        Event not found.
      </div>
    );
  }

  const startOfMonth = currentMonth.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();
  const days = [];
  for (let index = 0; index < startDay; index += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(currentMonth.date(day));
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-3xl"
              style={{ backgroundColor: eventType.color }}
            >
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                Hosted by
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">
                {eventType.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {eventType.description}
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--hover)] p-5 text-sm text-[var(--text)]">
            <div className="flex items-center gap-3">
              <Clock size={16} />
              <span>{eventType.duration} minutes</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Globe size={16} />
              <span>
                {availability[0]?.timezone?.replace("_", " ") || "Asia/Kolkata"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-xl">
          {step === "calendar" ? (
            <>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                    Pick a date
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                    Select a day
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--hover)] px-3 py-2 text-sm text-[var(--text)]">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth((prev) => prev.subtract(1, "month"))
                    }
                    className="rounded-full p-2 hover:bg-[var(--panel-border)] transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>{currentMonth.format("MMMM YYYY")}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth((prev) => prev.add(1, "month"))
                    }
                    className="rounded-full p-2 hover:bg-[var(--panel-border)] transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-[var(--muted)]">
                {WEEKDAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) return <div key={`empty-${index}`} />;
                  const dateKey = day.format("YYYY-MM-DD");
                  const available = isAvailableDay(day);
                  const selected = selectedDate === dateKey;
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedDate(dateKey);
                        setSelectedSlot("");
                      }}
                      className={`rounded-3xl py-3 text-sm font-semibold transition border border-transparent ${selected ? "bg-brand text-white shadow-md shadow-brand/20" : available ? "bg-[var(--hover)] text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--panel-bg)] cursor-pointer" : "bg-transparent text-[var(--muted)] opacity-50 cursor-not-allowed"}`}
                    >
                      {day.date()}
                    </button>
                  );
                })}
              </div>

              {selectedDate ? (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Available times
                  </p>
                  {slots.length ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition outline-none ${selectedSlot === slot ? "border-brand bg-brand text-white shadow-lg shadow-brand/20" : "border-[var(--panel-border)] text-[var(--text)] bg-[var(--panel-bg)] hover:border-[var(--text)]"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--muted)]">
                      No available times on this day.
                    </p>
                  )}
                </div>
              ) : null}

              {selectedSlot ? (
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="mt-6 w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Book now
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("calendar")}
                className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition"
              >
                <ChevronLeft size={16} /> Back to calendar
              </button>
              <div className="rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--hover)] p-5 mb-6">
                <p className="text-sm text-[var(--muted)]">Booking</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                  {dayjs(selectedDate).format("dddd, MMM D")}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {selectedSlot} • {eventType.duration} minutes
                </p>
              </div>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="mt-2 w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    rows="4"
                    className="mt-2 w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                    placeholder="Share anything helpful for the meeting"
                  />
                </div>
                
                {(eventType.customQuestions || []).map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-[var(--text)]">
                      {q}
                    </label>
                    <input
                      required
                      value={customAnswers[q] || ""}
                      onChange={(e) => setCustomAnswers(prev => ({...prev, [q]: e.target.value}))}
                      className="mt-2 w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                      placeholder={`Your answer for ${q}`}
                    />
                  </div>
                ))}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark disabled:opacity-60"
                >
                  {submitting ? "Booking..." : "Confirm booking"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

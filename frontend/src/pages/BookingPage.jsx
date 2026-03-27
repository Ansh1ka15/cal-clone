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
import { Clock, Globe, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [step, setStep] = useState("calendar");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getEventTypeBySlug(slug), getAvailability()])
      .then(([eventRes, availRes]) => {
        setEventType(eventRes.data);
        setAvailability(availRes.data);
      })
      .catch(() => toast.error("Unable to load booking page"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !eventType) return;
    const dayName = dayjs(selectedDate).format("dddd");
    const dayAvail = availability.find((item) => item.day === dayName);
    if (!dayAvail?.isAvailable) {
      setSlots([]);
      return;
    }

    getBookedSlots(eventType.id, selectedDate)
      .then(({ data }) => {
        const booked = new Set(data.map((item) => item.startTime));
        const generated = [];
        let [hour, minute] = dayAvail.startTime.split(":").map(Number);
        const endMinutes =
          Number(dayAvail.endTime.split(":")[0]) * 60 +
          Number(dayAvail.endTime.split(":")[1]);
        const isToday = dayjs(selectedDate).isSame(dayjs(), "day");
        const now = dayjs();

        while (hour * 60 + minute + eventType.duration <= endMinutes) {
          const slot = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          const slotTime = dayjs(`${selectedDate}T${slot}`);
          if (!booked.has(slot) && (!isToday || slotTime.isAfter(now))) {
            generated.push(slot);
          }
          minute += eventType.duration;
          hour += Math.floor(minute / 60);
          minute %= 60;
        }
        setSlots(generated);
      })
      .catch(() => setSlots([]));
  }, [availability, eventType, selectedDate]);

  const isAvailableDay = (date) => {
    if (!availability.length || date.isBefore(dayjs(), "day")) return false;
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
        date: selectedDate,
        startTime: selectedSlot,
        endTime,
      });
      navigate("/booking-confirmed", {
        state: { booking: response.data, eventType },
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-gray-500">
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
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-3xl"
              style={{ backgroundColor: eventType.color }}
            >
              <span className="text-xl font-semibold text-white">U</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hosted by Default User</p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                {eventType.title}
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500">{eventType.description}</p>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{eventType.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>{availability[0]?.timezone || "Asia/Kolkata"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-lg">
          {step === "calendar" ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Pick a date
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) => prev.subtract(1, "month"))
                    }
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) => prev.add(1, "month"))
                    }
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-gray-500">
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
                      className={`rounded-3xl py-3 text-sm font-semibold transition ${selected ? "bg-brand text-white" : available ? "bg-gray-100 text-gray-900 hover:bg-brand-light" : "text-gray-300"}`}
                    >
                      {day.date()}
                    </button>
                  );
                })}
              </div>

              {selectedDate ? (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900">
                    Available times
                  </p>
                  {slots.length ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${selectedSlot === slot ? "border-brand bg-brand text-white" : "border-gray-200 text-gray-700 hover:border-brand hover:text-brand"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
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
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={16} /> Back to calendar
              </button>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 mb-6">
                <p className="text-sm text-gray-500">Booking</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {dayjs(selectedDate).format("dddd, MMM D")}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedSlot} • {eventType.duration} minutes
                </p>
              </div>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
                    placeholder="Share anything helpful for the meeting"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
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

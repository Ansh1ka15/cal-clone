import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAvailability, saveAvailability } from "../api/index.js";
import { Save } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const TIMES = Array.from({ length: 24 * 2 + 1 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

export default function Availability() {
  const [schedule, setSchedule] = useState([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAvailability()
      .then(({ data }) => {
        setSchedule(data);
        if (data.length) setTimezone(data[0].timezone || "Asia/Kolkata");
      })
      .catch(() => toast.error("Failed to load availability"))
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (day, field, value) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveAvailability({ schedule, timezone });
      toast.success("Availability updated");
    } catch {
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Availability</h1>
          <p className="mt-2 text-sm text-gray-500">
            Set the days and times when you accept bookings.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.day}
              className="grid gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-[120px_auto_auto] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={(event) =>
                      updateDay(item.day, "isAvailable", event.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-brand"></div>
                  <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
                <span className="text-sm font-semibold text-gray-900">
                  {item.day}
                </span>
              </div>

              {item.isAvailable ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Starts</p>
                      <select
                        value={item.startTime}
                        onChange={(event) =>
                          updateDay(item.day, "startTime", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
                      >
                        {TIMES.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ends</p>
                      <select
                        value={item.endTime}
                        onChange={(event) =>
                          updateDay(item.day, "endTime", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-brand/20"
                      >
                        {TIMES.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-sm text-gray-500 sm:col-span-2">
                  Unavailable
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

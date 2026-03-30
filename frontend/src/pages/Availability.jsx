import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  getSchedules, 
  getSchedule, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  duplicateSchedule
} from "../api/index.js";
import { Globe2, Plus, ArrowLeft, Trash2, Edit2, Copy, MoreHorizontal } from "lucide-react";

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIMEZONES = [
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const formatTime = (time) => {
  if (!time) return "";
  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute}${period}`;
};

const buildSummaryText = (availabilities) => {
  if (!availabilities || !Array.isArray(availabilities)) return "No availability set";
  const availableDays = availabilities.filter((day) => day.isAvailable);
  if (!availableDays.length) return "No availability set";

  const sameTimeAndSlots = availableDays.every(
    (day) =>
      day.slots && 
      availableDays[0].slots &&
      day.slots.length === availableDays[0].slots.length &&
      day.slots.every((slot, i) => slot.startTime === availableDays[0].slots[i].startTime && slot.endTime === availableDays[0].slots[i].endTime)
  );

  if (availableDays.length === 7 && sameTimeAndSlots) {
    const s = availableDays[0].slots[0];
    return `Daily, ${formatTime(s.startTime)} - ${formatTime(s.endTime)}${availableDays[0].slots.length > 1 ? ' & more' : ''}`;
  }

  const weekdayRange = DAYS_ORDER.slice(1, 6).every((dayName) =>
    availableDays.some((day) => day.day === dayName),
  );
  if (weekdayRange && sameTimeAndSlots && availableDays.length === 5) {
    const s = availableDays[0].slots[0];
    return `Mon - Fri, ${formatTime(s.startTime)} - ${formatTime(s.endTime)}${availableDays[0].slots.length > 1 ? ' & more' : ''}`;
  }

  return availableDays.map((day) => day.day.slice(0, 3)).join(", ");
};

function CreateScheduleModal({ onClose, onSave }) {
  const [name, setName] = useState("Working hours");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl flex flex-col p-6">
        <h2 className="text-xl font-bold text-[var(--text)]">Add a new schedule</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          <label className="block text-sm font-semibold text-[var(--text)]">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Working hours"
              required
              className="mt-2 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </label>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--hover)]"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-[var(--panel-bg)] shadow-md transition hover:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CopyOverlay({ dayIndex, onApply, onCancel }) {
  const [selectedDays, setSelectedDays] = useState(new Set());

  const toggleDay = (i) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedDays.size === 7) setSelectedDays(new Set());
    else setSelectedDays(new Set([0,1,2,3,4,5,6]));
  };

  return (
    <div className="absolute top-10 left-0 z-50 w-56 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl p-4 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Copy times to</div>
      
      <label className="flex items-center gap-3 py-1 cursor-pointer hover:opacity-80">
        <input 
          type="checkbox" 
          checked={selectedDays.size === 7} 
          onChange={toggleAll}
          className="h-4 w-4 rounded border-[var(--panel-border)] text-[var(--text)]" 
        />
        <span className="text-sm font-medium">Select all</span>
      </label>
      
      <div className="h-px w-full bg-[var(--panel-border)] my-1" />
      
      {DAYS_ORDER.map((day, i) => (
        <label key={day} className="flex items-center gap-3 py-1.5 cursor-pointer hover:opacity-80">
          <input 
            type="checkbox" 
            checked={selectedDays.has(i)}
            disabled={i === dayIndex}
            onChange={() => toggleDay(i)}
            className="h-4 w-4 rounded border-[var(--panel-border)] text-[var(--text)]" 
          />
          <span className={`text-sm ${i === dayIndex ? 'text-[var(--muted)]' : ''}`}>{day}</span>
        </label>
      ))}

      <div className="flex items-center justify-between mt-4">
        <button type="button" onClick={onCancel} className="text-sm font-semibold hover:opacity-80">Cancel</button>
        <button 
          type="button"
          onClick={() => onApply(Array.from(selectedDays))}
          className="rounded-full bg-[var(--text)] px-4 py-1.5 text-sm font-bold text-[var(--panel-bg)] transition hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default function Availability() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [copyingDayIndex, setCopyingDayIndex] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const fetchSchedules = async () => {
    try {
      const { data } = await getSchedules();
      setSchedules(data);
    } catch {
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async (name) => {
    try {
      await createSchedule({ name });
      toast.success("Schedule created");
      setCreating(false);
      fetchSchedules();
    } catch {
      toast.error("Unable to create schedule");
    }
  };

  const handleEditInit = async (id) => {
    setLoading(true);
    try {
      const { data } = await getSchedule(id);
      setEditingSchedule(data);
    } catch {
      toast.error("Failed to load schedule details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await updateSchedule(editingSchedule.id, editingSchedule);
      toast.success("Schedule saved");
      setEditingSchedule(null);
      fetchSchedules();
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await deleteSchedule(editingSchedule.id);
      toast.success("Schedule deleted");
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleDeleteScheduleById = async (schedule) => {
    if (schedule.isDefault) {
      toast.error("Cannot delete the default schedule");
      return;
    }
    if (!window.confirm(`Delete ${schedule.name}?`)) return;
    try {
      await deleteSchedule(schedule.id);
      toast.success("Schedule deleted");
      fetchSchedules();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDuplicateSchedule = async (id) => {
    try {
      await duplicateSchedule(id);
      toast.success("Schedule duplicated");
      fetchSchedules();
    } catch {
      toast.error("Unable to duplicate schedule");
    }
  };

  const updateDayToggle = (dayIndex, value) => {
    setEditingSchedule((prev) => {
      const newAvails = [...prev.availabilities];
      newAvails[dayIndex] = { ...newAvails[dayIndex], isAvailable: value };
      if (value && (!newAvails[dayIndex].slots || newAvails[dayIndex].slots.length === 0)) {
        newAvails[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
      }
      return { ...prev, availabilities: newAvails };
    });
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setEditingSchedule((prev) => {
      const newAvails = [...prev.availabilities];
      newAvails[dayIndex] = { ...newAvails[dayIndex] };
      const newSlots = [...(newAvails[dayIndex].slots || [])];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      newAvails[dayIndex].slots = newSlots;
      return { ...prev, availabilities: newAvails };
    });
  };

  const addSlot = (dayIndex) => {
    setEditingSchedule(prev => {
      const newAvails = [...prev.availabilities];
      newAvails[dayIndex] = { ...newAvails[dayIndex] };
      const newSlots = [...(newAvails[dayIndex].slots || [])];
      const lastSlot = newSlots[newSlots.length - 1];
      const start = lastSlot ? lastSlot.endTime : "09:00";
      let nextEndHour = parseInt(start.split(':')[0]) + 1;
      if (nextEndHour > 23) nextEndHour = 23;
      const end = `${String(nextEndHour).padStart(2,'0')}:00`;
      
      newSlots.push({ startTime: start, endTime: end });
      newAvails[dayIndex].slots = newSlots;
      return { ...prev, availabilities: newAvails };
    });
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setEditingSchedule(prev => {
      const newAvails = [...prev.availabilities];
      newAvails[dayIndex] = { ...newAvails[dayIndex] };
      newAvails[dayIndex].slots = newAvails[dayIndex].slots.filter((_, i) => i !== slotIndex);
      if (newAvails[dayIndex].slots.length === 0) {
        newAvails[dayIndex].isAvailable = false;
        newAvails[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
      }
      return { ...prev, availabilities: newAvails };
    });
  };

  const handleCopyApply = (sourceDayIndex, targetDays) => {
    setEditingSchedule(prev => {
      const newAvails = [...prev.availabilities];
      const sourceSlots = newAvails[sourceDayIndex].slots || [{ startTime: "09:00", endTime: "17:00" }];
      targetDays.forEach(i => {
        if (i !== sourceDayIndex) {
          newAvails[i] = { 
            ...newAvails[i], 
            isAvailable: true, 
            slots: sourceSlots.map(s => ({ ...s })) 
          };
        }
      });
      return { ...prev, availabilities: newAvails };
    });
    setCopyingDayIndex(null);
  };

  // Override tools
  const addOverride = () => {
    setEditingSchedule((prev) => ({
      ...prev,
      overrides: [
        ...(prev.overrides || []),
        { date: new Date().toISOString().split('T')[0], isAvailable: true, slots: [{ startTime: "09:00", endTime: "17:00" }] }
      ]
    }));
  };

  const removeOverride = (idx) => {
    setEditingSchedule(prev => ({
      ...prev,
      overrides: prev.overrides.filter((_, i) => i !== idx)
    }));
  };

  const updateOverrideDate = (idx, newDate) => {
    setEditingSchedule(prev => {
      const o = [...prev.overrides];
      o[idx].date = newDate;
      return { ...prev, overrides: o };
    });
  };

  const updateOverrideAvailable = (idx, val) => {
    setEditingSchedule(prev => {
      const o = [...prev.overrides];
      o[idx].isAvailable = val;
      if (val && (!o[idx].slots || o[idx].slots.length === 0)) o[idx].slots = [{ startTime: "09:00", endTime: "17:00" }];
      return { ...prev, overrides: o };
    });
  };

  const updateOverrideSlot = (overrideIndex, slotIndex, field, value) => {
    setEditingSchedule(prev => {
      const o = [...prev.overrides];
      const s = [...o[overrideIndex].slots];
      s[slotIndex] = { ...s[slotIndex], [field]: value };
      o[overrideIndex].slots = s;
      return { ...prev, overrides: o };
    });
  };
  
  const addOverrideSlot = (overrideIndex) => {
    setEditingSchedule(prev => {
      const o = [...prev.overrides];
      const s = [...(o[overrideIndex].slots || [])];
      const lastSlot = s[s.length - 1];
      const start = lastSlot ? lastSlot.endTime : "09:00";
      let nextEndHour = parseInt(start.split(':')[0]) + 1;
      if (nextEndHour > 23) nextEndHour = 23;
      const end = `${String(nextEndHour).padStart(2,'0')}:00`;
      s.push({ startTime: start, endTime: end });
      o[overrideIndex].slots = s;
      return { ...prev, overrides: o };
    });
  };

  const removeOverrideSlot = (overrideIndex, slotIndex) => {
    setEditingSchedule(prev => {
      const o = [...prev.overrides];
      o[overrideIndex].slots = o[overrideIndex].slots.filter((_, idx) => idx !== slotIndex);
      if (o[overrideIndex].slots.length === 0) {
        o[overrideIndex].isAvailable = false;
        o[overrideIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
      }
      return { ...prev, overrides: o };
    });
  };


  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text)] border-t-transparent" />
      </div>
    );
  }

  // --- EDIT SCHEDULE VIEW ---
  if (editingSchedule) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 text-[var(--text)] pb-12 p-2">
        
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2 border-b border-[var(--panel-border)] pb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setEditingSchedule(null)}
              className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-md transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{editingSchedule.name}</h1>
              <Edit2 size={16} className="text-[var(--muted)]" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Set as default</span>
              <button
                type="button"
                onClick={() => setEditingSchedule(prev => ({...prev, isDefault: !prev.isDefault}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editingSchedule.isDefault ? "bg-[var(--text)]" : "bg-[var(--panel-border)]"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--panel-bg)] transition-transform ${
                  editingSchedule.isDefault ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            
            <div className="h-6 w-px bg-[var(--panel-border)]" />
            
            <button 
              onClick={handleDeleteSchedule}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition"
            >
              <Trash2 size={20} />
            </button>
            
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="rounded-xl bg-[var(--text)] px-5 py-2 text-sm font-semibold text-[var(--panel-bg)] transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6">
          
          {/* Days Box */}
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 overflow-hidden">
            <div className="flex flex-col">
              {editingSchedule.availabilities.map((day, index) => (
                <div key={day.day} className="flex flex-col sm:flex-row p-4 py-5 border-b border-[var(--panel-border)] last:border-0 hover:bg-[var(--hover)]/50 transition">
                  <div className="flex items-center gap-3 w-40 mb-3 sm:mb-0 sm:mt-2">
                    <button
                      type="button"
                      onClick={() => updateDayToggle(index, !day.isAvailable)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        day.isAvailable ? "bg-[var(--text)]" : "bg-[var(--panel-border)]"
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[var(--panel-bg)] transition-transform ${
                        day.isAvailable ? "translate-x-4" : "translate-x-1"
                      }`} />
                    </button>
                    <span className={`text-sm font-medium ${!day.isAvailable ? 'text-[var(--muted)] line-through opacity-70' : 'text-[var(--text)]'}`}>
                      {day.day}
                    </span>
                  </div>
                  
                  {day.isAvailable ? (
                    <div className="flex flex-col gap-3 flex-grow">
                      {day.slots && day.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={slot.startTime}
                            onChange={(e) => updateSlot(index, slotIndex, "startTime", e.target.value)}
                            className="rounded-md border border-[var(--panel-border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--text)]"
                          />
                          <span className="text-[var(--muted)]">-</span>
                          <input 
                            type="time" 
                            value={slot.endTime}
                            onChange={(e) => updateSlot(index, slotIndex, "endTime", e.target.value)}
                            className="rounded-md border border-[var(--panel-border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--text)]"
                          />
                          
                          {slotIndex === 0 && (
                            <button 
                              onClick={() => addSlot(index)} 
                              className="p-1.5 ml-1 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-border)] rounded transition"
                              title="Add new time slot"
                            >
                              <Plus size={16} />
                            </button>
                          )}

                          {slotIndex === 0 && (
                            <div className="relative">
                              <button 
                                onClick={() => setCopyingDayIndex(copyingDayIndex === index ? null : index)}
                                className={`p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-border)] rounded transition ${copyingDayIndex === index ? 'bg-[var(--panel-border)] text-[var(--text)]' : ''}`}
                                title="Copy times"
                              >
                                <Copy size={16} />
                              </button>
                              {copyingDayIndex === index && (
                                <CopyOverlay 
                                  dayIndex={index} 
                                  onApply={(days) => handleCopyApply(index, days)} 
                                  onCancel={() => setCopyingDayIndex(null)} 
                                />
                              )}
                            </div>
                          )}
                          
                          {(day.slots.length > 1 || slotIndex > 0) && (
                            <button 
                              onClick={() => removeSlot(index, slotIndex)}
                              className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition"
                              title="Delete time slot"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sm:mt-2">
                       <span className="text-sm text-[var(--muted)] italic">Unavailable</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timezone Box */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Timezone</label>
              <select
                value={editingSchedule.timezone}
                onChange={(e) => setEditingSchedule({...editingSchedule, timezone: e.target.value})}
                className="w-full rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--text)]"
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overrides Box */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold">Date overrides</h3>
            <p className="text-sm text-[var(--muted)]">Add dates when your availability changes from your weekly hours.</p>

            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 overflow-hidden">
              <div className="flex flex-col">
                {(editingSchedule.overrides || []).map((override, index) => (
                  <div key={index} className="flex flex-col sm:flex-row p-4 py-5 border-b border-[var(--panel-border)] last:border-0 hover:bg-[var(--hover)]/50 transition">
                    <div className="flex items-center gap-3 w-40 mb-3 sm:mb-0 sm:mt-2">
                      <button
                        type="button"
                        onClick={() => updateOverrideAvailable(index, !override.isAvailable)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          override.isAvailable ? "bg-[var(--text)]" : "bg-[var(--panel-border)]"
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[var(--panel-bg)] transition-transform ${
                          override.isAvailable ? "translate-x-4" : "translate-x-1"
                        }`} />
                      </button>
                      <input 
                        type="date"
                        value={override.date}
                        onChange={(e) => updateOverrideDate(index, e.target.value)}
                        className="bg-transparent text-sm font-medium text-[var(--text)] outline-none w-[110px]"
                      />
                    </div>
                    
                    {override.isAvailable ? (
                      <div className="flex flex-col gap-3 flex-grow">
                        {override.slots && override.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2">
                            <input 
                              type="time" 
                              value={slot.startTime}
                              onChange={(e) => updateOverrideSlot(index, slotIndex, "startTime", e.target.value)}
                              className="rounded-md border border-[var(--panel-border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--text)]"
                            />
                            <span className="text-[var(--muted)]">-</span>
                            <input 
                              type="time" 
                              value={slot.endTime}
                              onChange={(e) => updateOverrideSlot(index, slotIndex, "endTime", e.target.value)}
                              className="rounded-md border border-[var(--panel-border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--text)]"
                            />
                            
                            {slotIndex === 0 && (
                              <button 
                                onClick={() => addOverrideSlot(index)} 
                                className="p-1.5 ml-1 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-border)] rounded transition"
                                title="Add new time slot"
                              >
                                <Plus size={16} />
                              </button>
                            )}

                            {(override.slots.length > 1 || slotIndex > 0) && (
                              <button 
                                onClick={() => removeOverrideSlot(index, slotIndex)}
                                className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition"
                                title="Delete time slot"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="sm:mt-2 flex-grow flex justify-between items-center">
                         <span className="text-sm text-[var(--muted)] italic">Unavailable</span>
                      </div>
                    )}
                    <div className="flex items-center self-start sm:self-auto ml-auto sm:mt-2">
                       <button 
                         onClick={() => removeOverride(index)}
                         className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition"
                         title="Delete override"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
                
                <div className="p-4">
                  <button onClick={addOverride} className="inline-flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]">
                    <Plus size={16} /> Add an override
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className="mx-auto max-w-5xl space-y-6 text-[var(--text)] pb-12 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Availability</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Configure times when you are available for bookings.</p>
        </div>
        <div>
          <button 
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2.5 text-sm font-semibold text-[var(--panel-bg)] transition hover:opacity-90"
          >
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {schedules.map(schedule => (
          <div 
            key={schedule.id}
            onClick={() => handleEditInit(schedule.id)}
            className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 cursor-pointer hover:bg-[var(--hover)] transition"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-[var(--text)]">{schedule.name}</h3>
                {schedule.isDefault && (
                  <span className="rounded bg-[var(--panel-border)] px-2 py-0.5 text-xs font-semibold text-[var(--text)]">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {buildSummaryText(schedule.availabilities)}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Globe2 size={12} /> {schedule.timezone}
              </div>
            </div>
            <div className="relative">
              <button 
                className="p-2 text-[var(--muted)] hover:text-[var(--text)] transition rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(dropdownOpen === schedule.id ? null : schedule.id);
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {dropdownOpen === schedule.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setDropdownOpen(null); }} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-xl p-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDropdownOpen(null); handleDuplicateSchedule(schedule.id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition"
                    >
                      <Copy size={16} /> Duplicate
                    </button>
                    {!schedule.isDefault && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDropdownOpen(null); handleDeleteScheduleById(schedule); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition mt-0.5"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">No schedules found.</div>
        )}
      </div>

      {creating && (
        <CreateScheduleModal onClose={() => setCreating(false)} onSave={handleCreateSchedule} />
      )}
    </div>
  );
}

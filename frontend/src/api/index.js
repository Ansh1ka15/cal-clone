import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://cal-clone-v6nb.onrender.com/api",
  headers: { 'Content-Type': 'application/json' },
});

export const getEventTypes = () => api.get('/event-types');
export const getEventTypeBySlug = (slug) => api.get(`/event-types/slug/${slug}`);
export const createEventType = (data) => api.post('/event-types', data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`);

export const getAvailability = () => api.get('/availability');
export const saveAvailability = (data) => api.post('/availability', data);
export const updateAvailability = (data) => api.put('/availability', data);

export const getSchedules = () => api.get("/schedules");
export const getSchedule = (id) => api.get(`/schedules/${id}`);
export const createSchedule = (data) => api.post("/schedules", data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);
export const duplicateSchedule = (id) => api.post(`/schedules/${id}/duplicate`);

export const getBookings = (tab) => api.get(`/bookings${tab ? `?tab=${tab}` : ''}`);
export const getBookedSlots = (eventTypeId, date) => api.get(`/bookings/slots?eventTypeId=${eventTypeId}&date=${date}`);
export const createBooking = (data) => api.post('/bookings', data);
export const cancelBooking = (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason });
export const rescheduleBooking = (id, data) => api.patch(`/bookings/${id}/reschedule`, data);

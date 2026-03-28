import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Mail } from "lucide-react";
import dayjs from "dayjs";

export default function BookingConfirm() {
  const { state } = useLocation();
  const savedState =
    typeof window !== "undefined"
      ? sessionStorage.getItem("bookingConfirm")
      : null;
  const parsedState = savedState ? JSON.parse(savedState) : null;
  const finalState =
    state && state.booking && state.eventType ? state : parsedState;

  if (!finalState || !finalState.booking || !finalState.eventType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-center">
        <div className="rounded-3xl bg-white p-10 shadow-lg">
          <p className="text-lg font-semibold text-gray-900">
            Booking details not available.
          </p>
          <Link to="/" className="mt-4 inline-block text-brand hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { booking, eventType } = finalState;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-center rounded-3xl bg-green-50 p-5">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">You're booked!</h1>
        <p className="mt-3 text-sm text-gray-500">
          A confirmation email has been sent to {booking.bookerEmail}.
        </p>

        <div className="mt-8 space-y-4 rounded-3xl bg-gray-50 p-6">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Calendar size={18} className="text-gray-400" />
            <div>
              <p className="text-xs uppercase text-gray-500">Date</p>
              <p className="font-medium">
                {dayjs(booking.date).format("dddd, MMMM D, YYYY")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Clock size={18} className="text-gray-400" />
            <div>
              <p className="text-xs uppercase text-gray-500">Time</p>
              <p className="font-medium">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs uppercase text-gray-500">Attendee</p>
              <p className="font-medium">
                {booking.bookerName} · {booking.bookerEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="rounded-3xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            to={`/booking/${eventType.slug}`}
            className="rounded-3xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Book again
          </Link>
        </div>
      </div>
    </div>
  );
}

import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text)]">
      <Sidebar />
      <main className="min-h-screen md:pl-[18rem]">
        <div className="min-h-screen bg-[var(--body-bg)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

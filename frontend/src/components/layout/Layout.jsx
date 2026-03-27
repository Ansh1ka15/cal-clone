import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto">{children}</main>
    </div>
  );
}

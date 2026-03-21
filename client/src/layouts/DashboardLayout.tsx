import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { usersApi } from "@/api/users.api";

const navItems = [
  { to: "/", label: "Dashboard", roles: ["admin", "student", "lecturer", "course_advisor"] },
  { to: "/courses", label: "Course Catalog", roles: ["admin", "student", "lecturer", "course_advisor"] },
  { to: "/my-courses", label: "My Courses", roles: ["student"] },
  { to: "/programs", label: "Programs", roles: ["admin", "course_advisor"] },
  { to: "/users", label: "Users", roles: ["admin"] },
];

export default function DashboardLayout() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      usersApi.getMe().then(setUser).catch(() => {});
    }
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role;
  const visibleNav = navItems.filter((item) => !role || item.roles.includes(role));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-indigo-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-indigo-800">
          <h1 className="text-lg font-bold leading-tight">Course Registration</h1>
          {user && (
            <p className="text-xs text-indigo-300 mt-1">
              {user.firstName} {user.lastName} · {user.role}
            </p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-700 text-white"
                    : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

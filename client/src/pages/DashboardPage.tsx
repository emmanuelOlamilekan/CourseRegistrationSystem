import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { registrationApi } from "@/api/registration.api";
import { usersApi } from "@/api/users.api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();

  useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe().then((u) => { setUser(u); return u; }),
    enabled: !user,
  });

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => registrationApi.getMyRegistrations(),
    enabled: user?.role === "student",
  });

  const enrolled = registrations?.filter((r) => r.status === "enrolled") ?? [];
  const completed = registrations?.filter((r) => r.status === "completed") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-gray-500 mt-1 text-sm capitalize">{user?.role ?? "Loading..."}</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {user?.role === "student" && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Enrolled courses</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{enrolled.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Completed courses</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{completed.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total registrations</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{registrations?.length ?? 0}</p>
          </Card>
        </div>
      )}

      {user?.role === "student" && !isLoading && enrolled.length > 0 && (
        <Card title="Current semester courses">
          <ul className="divide-y divide-gray-100">
            {enrolled.map((r) => (
              <li key={r._id} className="py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {r.courseId}
                </span>
                <Badge variant="blue">Enrolled</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(user?.role === "admin" || user?.role === "course_advisor") && (
        <Card title="Quick links">
          <ul className="space-y-2 text-sm text-gray-700">
            <li><a href="/programs" className="text-indigo-600 hover:underline">Manage Programs & Curricula</a></li>
            <li><a href="/courses" className="text-indigo-600 hover:underline">Browse Course Catalog</a></li>
            {user.role === "admin" && (
              <li><a href="/users" className="text-indigo-600 hover:underline">Manage Users</a></li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}

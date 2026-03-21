import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationApi } from "@/api/registration.api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";

const statusVariant: Record<string, "blue" | "green" | "red" | "gray"> = {
  enrolled: "blue",
  completed: "green",
  dropped: "red",
};

export default function MyCoursesPage() {
  const queryClient = useQueryClient();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => registrationApi.getMyRegistrations(),
  });

  const dropMutation = useMutation({
    mutationFn: (courseId: string) => registrationApi.drop(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-registrations"] }),
  });

  const active = registrations?.filter((r) => r.status === "enrolled") ?? [];
  const history = registrations?.filter((r) => r.status !== "enrolled") ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {dropMutation.isError && (
        <Alert variant="error">
          {(dropMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Drop failed"}
        </Alert>
      )}

      {!isLoading && active.length === 0 && (
        <p className="text-gray-500 text-sm">No active enrollments.</p>
      )}

      {active.length > 0 && (
        <Card title="Active enrollments">
          <ul className="divide-y divide-gray-100">
            {active.map((r) => (
              <li key={r._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.courseId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enrolled {new Date(r.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant[r.status] ?? "gray"}>{r.status}</Badge>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={dropMutation.isPending}
                    onClick={() => dropMutation.mutate(r.courseId)}
                  >
                    Drop
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {history.length > 0 && (
        <Card title="History">
          <ul className="divide-y divide-gray-100">
            {history.map((r) => (
              <li key={r._id} className="py-3 flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-900">{r.courseId}</p>
                <Badge variant={statusVariant[r.status] ?? "gray"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

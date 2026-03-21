import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/api/courses.api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

export default function CatalogPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search],
    queryFn: () => coursesApi.getCourses({ search: search || undefined }),
  });

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
        <span className="text-sm text-gray-500">{data?.total ?? 0} courses</span>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <p className="text-gray-500 text-sm">No courses found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course._id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-indigo-600 font-semibold">{course.code}</p>
                <h3 className="font-semibold text-gray-900 mt-0.5">{course.title}</h3>
              </div>
              <Badge variant={course.isActive ? "green" : "red"}>
                {course.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {course.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{course.description}</p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Dept: {course.departmentId}</span>
              <span>Capacity: {course.capacity ?? "—"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

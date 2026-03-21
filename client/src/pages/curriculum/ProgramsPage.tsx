import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { curriculumApi } from "@/api/curriculum.api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import type { Program, Curriculum } from "@/types";

export default function ProgramsPage() {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const { data: programsData, isLoading: loadingPrograms } = useQuery({
    queryKey: ["programs"],
    queryFn: () => curriculumApi.getPrograms(),
  });

  const { data: curricula, isLoading: loadingCurricula } = useQuery({
    queryKey: ["curricula", selectedProgram?._id],
    queryFn: () => curriculumApi.getCurriculaByProgram(selectedProgram!._id),
    enabled: !!selectedProgram,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => curriculumApi.activateCurriculum(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curricula", selectedProgram?._id] }),
  });

  const programs = programsData?.programs ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Programs</h1>

      {loadingPrograms && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {activateMutation.isError && (
        <Alert variant="error">Failed to activate curriculum</Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs list */}
        <div className="space-y-3">
          {programs.map((program) => (
            <button
              key={program._id}
              onClick={() => setSelectedProgram(program)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedProgram?._id === program._id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <p className="font-semibold text-gray-900">{program.name}</p>
              <p className="text-xs text-gray-500 mt-1">Duration: {program.duration} years</p>
              <div className="mt-1">
                <Badge variant={program.isActive ? "green" : "gray"}>
                  {program.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </button>
          ))}

          {!loadingPrograms && programs.length === 0 && (
            <p className="text-gray-500 text-sm">No programs found.</p>
          )}
        </div>

        {/* Curricula panel */}
        <div className="lg:col-span-2">
          {!selectedProgram && (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Select a program to view its curricula
            </div>
          )}

          {selectedProgram && (
            <Card title={`Curricula — ${selectedProgram.name}`}>
              {loadingCurricula ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : curricula && curricula.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {curricula.map((c: Curriculum) => (
                    <li key={c._id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Version {c.version}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={c.isActive ? "green" : "gray"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {!c.isActive && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={activateMutation.isPending}
                            onClick={() => activateMutation.mutate(c._id)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No curricula for this program.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

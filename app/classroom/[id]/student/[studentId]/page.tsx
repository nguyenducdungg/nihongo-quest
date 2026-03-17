/**
 * Teacher view — Student Progress in Classroom
 * Server Component: data is fetched on the server before sending HTML to client.
 * This eliminates the client-side waterfall (useEffect → loader → data).
 */

import { redirect } from "next/navigation";
import { getStudentProgressInClassroom } from "@/app/actions/classroom";
import StudentProgressView from "./StudentProgressView";

export default async function StudentProgressPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id, studentId } = await params;
  const data = await getStudentProgressInClassroom(id, studentId);

  if (!data) {
    redirect(`/classroom/${id}`);
  }

  return <StudentProgressView data={data} classroomId={id} />;
}

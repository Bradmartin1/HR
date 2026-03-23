import { redirect } from "next/navigation";

export default function EmployeeProfileRoot({ params }: { params: { employeeId: string } }) {
  redirect(`/employees/${params.employeeId}/overview`);
}

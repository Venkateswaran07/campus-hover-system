import { useAppState } from "@/lib/app-context";
import { mockStudent } from "@/lib/mock-data";
import StatusCard from "./StatusCard";

const StatusTracker = () => {
  const { requests } = useAppState();
  const myRequests = requests.filter((r) => r.studentId === mockStudent.id);

  if (myRequests.length === 0) {
    return (
      <div className="shadow-raised rounded-2xl bg-background p-8 text-center animate-float-up">
        <p className="text-muted-foreground font-outfit">No requests yet. Submit one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myRequests.map((req, i) => (
        <div key={req.id} className="animate-float-up" style={{ animationDelay: `${i * 80}ms` }}>
          <StatusCard request={req} />
        </div>
      ))}
    </div>
  );
};

export default StatusTracker;

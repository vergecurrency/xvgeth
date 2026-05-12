import { Alert, AlertDescription } from "@/components/ui/alert";

type StatusAlertProps = {
  status: string;
};

export function StatusAlert({ status }: StatusAlertProps) {
  return (
    <Alert>
      <AlertDescription className="overflow-hidden break-all whitespace-pre-wrap">{status}</AlertDescription>
    </Alert>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  physioName: string;
  physioId: string;
  previewMode: boolean;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  physioName,
  physioId,
  previewMode,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex items-start justify-between gap-8">
        {/* Left: Title & Meta */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-slate-500">
              Welcome back, {physioName}
            </p>
            {previewMode && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1">
                <svg
                  className="h-3.5 w-3.5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-xs font-medium text-amber-700">
                  Preview Mode
                </span>
              </div>
            )}
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1.5 text-base text-slate-600">{description}</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-start gap-3">
          {previewMode && (
            <Link href={`/physio/${physioId}/opt-in`}>
              <Button
                size="sm"
                className="bg-amber-600 text-white hover:bg-amber-700"
              >
                Go Live
              </Button>
            </Link>
          )}
          {actions}
        </div>
      </div>

      {/* Single border separator */}
      <div className="mt-6 border-t border-slate-200" />
    </div>
  );
}

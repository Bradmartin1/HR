import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils/format";

interface Note {
  id: string;
  content: string;
  is_private: boolean | null;
  created_by: string;
  created_at: string;
  author: { first_name: string; last_name: string } | null;
}

interface NotesTabProps {
  notes: Note[];
}

export function NotesTab({ notes }: NotesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes on record.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {note.author
                          ? `${note.author.first_name} ${note.author.last_name}`
                          : "Unknown"}
                      </span>
                      {note.is_private && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(note.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

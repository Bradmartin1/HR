"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";
import { type Role } from "@/lib/constants/roles";

interface DocumentType {
  id: string;
  name: string;
  requires_ack: boolean | null;
}

interface Document {
  id: string;
  name: string;
  storage_path: string;
  expiry_date: string | null;
  is_sensitive: boolean;
  created_at: string;
  document_types?: DocumentType | null;
}

interface DocumentsTabProps {
  documents: Document[];
  employeeId: string;
  role: Role;
}

export function DocumentsTab({ documents, employeeId, role }: DocumentsTabProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [acknowledgeLoadingId, setAcknowledgeLoadingId] = useState<string | null>(null);

  const canManage = ["owner", "hr_manager"].includes(role);

  async function handleView(docId: string) {
    setLoadingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) throw new Error("Failed to get document URL");
      const { url } = await res.json();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Could not open document. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAcknowledge(docId: string) {
    setAcknowledgeLoadingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/acknowledge`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to acknowledge");
      // Reload to reflect acknowledged_at update
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Could not acknowledge document. Please try again.");
    } finally {
      setAcknowledgeLoadingId(null);
    }
  }

  const isExpiringSoon = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Documents</CardTitle>
          {canManage && (
            <Button size="sm" asChild>
              <a href={`/employees/${employeeId}/documents/upload`}>Upload Document</a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No documents found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Expiry</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Flags</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Uploaded</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const docType = doc.document_types as DocumentType | null;
                  const requiresAck = docType?.requires_ack ?? false;
                  const needsAck = requiresAck;

                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="text-sm font-medium">{doc.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {docType?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {doc.expiry_date ? (
                          <span
                            className={
                              isExpired(doc.expiry_date)
                                ? "text-[#F15A22] font-medium"
                                : isExpiringSoon(doc.expiry_date)
                                ? "text-[#FFC20E] font-medium"
                                : ""
                            }
                          >
                            {formatDate(doc.expiry_date)}
                            {isExpired(doc.expiry_date) && (
                              <Badge className="ml-2 bg-[#fde8e1] text-[#F15A22] text-xs">Expired</Badge>
                            )}
                            {isExpiringSoon(doc.expiry_date) && !isExpired(doc.expiry_date) && (
                              <Badge className="ml-2 bg-[#fff4cc] text-[#7a5e00] text-xs">Expiring</Badge>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {doc.is_sensitive && (
                            <Badge className="bg-[#fde8e1] text-[#a33a14] hover:bg-[#fde8e1] text-xs">
                              Sensitive
                            </Badge>
                          )}
                          {requiresAck && (
                            <Badge className="bg-[#fff4cc] text-[#7a5e00] hover:bg-[#fff4cc] text-xs">
                              Needs Acknowledgement
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {needsAck && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(doc.id)}
                              disabled={acknowledgeLoadingId === doc.id}
                            >
                              {acknowledgeLoadingId === doc.id ? "Saving..." : "Acknowledge"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(doc.id)}
                            disabled={loadingId === doc.id || !doc.storage_path}
                          >
                            {loadingId === doc.id ? "Opening..." : "View"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

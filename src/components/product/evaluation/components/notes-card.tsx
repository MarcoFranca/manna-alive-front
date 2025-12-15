"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotesCard({ notes }: { notes: string[] }) {
    if (!notes || notes.length === 0) return null;

    return (
        <Card className="bg-background/70 backdrop-blur border rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base">Premissas e observações</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {notes.map((n, idx) => (
                        <li key={`${idx}-${n.slice(0, 20)}`}>{n}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

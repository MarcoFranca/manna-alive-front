"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { DecisionKind, ProductDecisionOut } from "@/types/evaluation";
import { createProductDecision } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
    productId: number;
    latestDecision?: ProductDecisionOut | null;
};

function decisionLabel(kind: DecisionKind): string {
    switch (kind) {
        case "approve_test":
            return "Aprovado para teste";
        case "approve_import":
            return "Aprovado para importar";
        case "reject":
            return "Reprovado";
        case "needs_data":
            return "Pendência de dados";
    }
}

function decisionBadgeVariant(kind: DecisionKind): "default" | "secondary" | "destructive" | "outline" {
    switch (kind) {
        case "approve_test":
        case "approve_import":
            return "default";
        case "needs_data":
            return "secondary";
        case "reject":
            return "destructive";
    }
}

export function DecisionActions({ productId, latestDecision }: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [decision, setDecision] = useState<DecisionKind>("approve_test");
    const [reason, setReason] = useState("");
    const [decidedBy, setDecidedBy] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = useMemo(() => reason.trim().length >= 3 && !submitting, [reason, submitting]);

    async function submit() {
        setSubmitting(true);
        setError(null);
        try {
            await createProductDecision(productId, {
                decision,
                reason: reason.trim(),
                decided_by: decidedBy.trim() ? decidedBy.trim() : undefined,
            });
            setOpen(false);
            setReason("");
            router.refresh(); // recarrega a evaluation page (server component) e traz latest_decision atualizado
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao salvar decisão");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
                <div className="text-sm font-medium">Decisão atual</div>
                {latestDecision ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={decisionBadgeVariant(latestDecision.decision)} className="text-xs">
                            {decisionLabel(latestDecision.decision)}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                            {latestDecision.decided_by ? `Por ${latestDecision.decided_by} • ` : null}
                            {new Date(latestDecision.created_at).toLocaleString()}
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground">Nenhuma decisão registrada ainda.</div>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <div className="flex flex-wrap gap-2">
                    <DialogTrigger asChild>
                        <Button variant="secondary" onClick={() => { setDecision("needs_data"); setReason(""); }}>
                            Pendenciar
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button variant="destructive" onClick={() => { setDecision("reject"); setReason(""); }}>
                            Reprovar
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setDecision("approve_test"); setReason(""); }}>
                            Aprovar teste
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => { setDecision("approve_import"); setReason(""); }}>
                            Aprovar importação
                        </Button>
                    </DialogTrigger>
                </div>

                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registrar decisão</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="text-sm">
                            Tipo: <span className="font-medium">{decisionLabel(decision)}</span>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-medium">Motivo / justificativa</div>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ex.: Margem ok no conservador, concorrência aceitável, sem impeditivos de NCM."
                            />
                            <div className="text-xs text-muted-foreground">Mínimo: 3 caracteres. Isso vira histórico e ajuda futuras decisões.</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-medium">Decidido por (opcional)</div>
                            <Input value={decidedBy} onChange={(e) => setDecidedBy(e.target.value)} placeholder="Ex.: Camila" />
                        </div>

                        {error ? <div className="text-sm text-destructive">{error}</div> : null}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button onClick={submit} disabled={!canSubmit}>
                            {submitting ? "Salvando..." : "Salvar decisão"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

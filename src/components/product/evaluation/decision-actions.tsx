"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProductDecisionOut, DecisionKind } from "@/types/decision";
import { createProductDecision } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    productId: number;
    latestDecision: ProductDecisionOut | null;
};

function decisionLabel(d: DecisionKind): string {
    switch (d) {
        case "approve_test":
            return "Aprovar para TESTE";
        case "approve_import":
            return "Aprovar para IMPORTAR";
        case "reject":
            return "Reprovar";
        case "needs_data":
            return "Precisa de dados";
    }
}

function decisionBadgeVariant(decision: DecisionKind): "default" | "secondary" | "destructive" | "outline" {
    if (decision === "approve_test" || decision === "approve_import") return "default";
    if (decision === "needs_data") return "secondary";
    if (decision === "reject") return "destructive";
    return "outline";
}

export function DecisionActions({ productId, latestDecision }: Props) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [decision, setDecision] = useState<DecisionKind>("approve_test");
    const [reason, setReason] = useState("");
    const [decidedBy, setDecidedBy] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return reason.trim().length >= 3 && !loading;
    }, [reason, loading]);

    async function onSubmit() {
        try {
            setLoading(true);
            await createProductDecision(productId, {
                decision,
                reason: reason.trim(),
                decided_by: decidedBy.trim() ? decidedBy.trim() : null,
            });

            setOpen(false);
            setReason("");
            setDecidedBy("");
            router.refresh();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Latest decision */}
            <div className="flex flex-wrap items-center gap-2">
                {latestDecision ? (
                    <>
                        <Badge variant={decisionBadgeVariant(latestDecision.decision)} className="text-xs">
                            Última decisão: {decisionLabel(latestDecision.decision)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
              {new Date(latestDecision.created_at).toLocaleString("pt-BR")}
                            {latestDecision.decided_by ? ` • por ${latestDecision.decided_by}` : ""}
            </span>
                    </>
                ) : (
                    <Badge variant="outline" className="text-xs">
                        Sem decisão registrada ainda
                    </Badge>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={() => setOpen(true)} className="shadow-[0_0_24px_-14px_rgba(217,70,239,0.9)]">
                    Registrar decisão
                </Button>

                <Button variant="secondary" onClick={() => router.push("/products")}>
                    Voltar para produtos
                </Button>
            </div>

            {/* Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Registrar decisão</DialogTitle>
                        <DialogDescription>
                            Grave sua decisão com justificativa. Isso vira histórico e aparece na triagem.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Tipo de decisão</div>
                            <Select value={decision} onValueChange={(v) => setDecision(v as DecisionKind)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="approve_test">{decisionLabel("approve_test")}</SelectItem>
                                    <SelectItem value="approve_import">{decisionLabel("approve_import")}</SelectItem>
                                    <SelectItem value="needs_data">{decisionLabel("needs_data")}</SelectItem>
                                    <SelectItem value="reject">{decisionLabel("reject")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Justificativa</div>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ex.: Aprova no conservador com 38% e demanda 6/dia; risco ok; testar com lote pequeno."
                                rows={5}
                            />
                            <div className="text-xs text-muted-foreground">
                                Mínimo 3 caracteres. Seja objetivo: “por que sim / por que não / o que falta”.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Decidido por (opcional)</div>
                            <Input
                                value={decidedBy}
                                onChange={(e) => setDecidedBy(e.target.value)}
                                placeholder="Ex.: Camila"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit} disabled={!canSubmit}>
                            {loading ? "Salvando..." : "Salvar decisão"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

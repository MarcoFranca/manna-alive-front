// wizard-footer.tsx
import { Button } from "@/components/ui/button";

export function WizardFooter({
                                 step,
                                 onBack,
                                 onNext,
                                 onFinish,
                                 loading,
                             }: any) {
    return (
        <div className="flex justify-between pt-4 border-t">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={step === 0}
                className="cursor-pointer"
            >
                Voltar
            </Button>

            {step < 3 ? (
                <Button onClick={onNext} className="cursor-pointer">
                    Próximo
                </Button>
            ) : (
                <Button onClick={onFinish} disabled={loading}>
                    {loading ? "Salvando..." : "Criar produto e avaliar"}
                </Button>
            )}
        </div>
    );
}

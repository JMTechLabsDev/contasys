"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarPago } from "@/actions/pago";

function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function PagoDialog({
  facturaId,
  saldo,
  facturaLabel,
}: {
  facturaId: string;
  saldo: number;
  facturaLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border bg-background hover:bg-accent" />}>
        <CreditCard className="h-4 w-4 mr-1" />
        Registrar Pago
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            fd.set("facturaId", facturaId);
            const res = await registrarPago(fd);
            if (res.success) {
              setOpen(false);
              router.refresh();
            }
          }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            {facturaLabel} — Saldo: {formatMoney(saldo)}
          </p>
          <input type="hidden" name="facturaId" value={facturaId} />
          <div>
            <label className="text-sm font-medium">Monto *</label>
            <Input type="number" name="monto" step="0.01" max={saldo} required placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium">Método de pago</label>
            <Input name="metodo" placeholder="Efectivo / Transferencia / Tarjeta" />
          </div>
          <div>
            <label className="text-sm font-medium">Referencia</label>
            <Input name="referencia" placeholder="N° transferencia, cheque, etc." />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de pago</label>
            <Input type="date" name="fechaPago" defaultValue={new Date().toISOString().split("T")[0]} />
          </div>
          <Button type="submit" className="w-full">Registrar pago</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

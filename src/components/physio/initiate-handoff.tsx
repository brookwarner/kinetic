"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initiateTransition } from "@/actions/transitions";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface InitiateHandoffProps {
  episodeId: string;
  physioId: string;
  availablePhysios: Array<{ id: string; name: string; clinicName: string }>;
}

export function InitiateHandoff({
  episodeId,
  physioId,
  availablePhysios,
}: InitiateHandoffProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destinationPhysioId, setDestinationPhysioId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleInitiate = async () => {
    if (!destinationPhysioId) return;

    setIsProcessing(true);
    const result = await initiateTransition({
      originEpisodeId: episodeId,
      transitionType: "physio-handoff",
      destinationPhysioId,
    });

    if (result.success) {
      setIsOpen(false);
      router.push(`/physio/${physioId}/handoffs`);
    } else {
      alert("Failed to initiate handoff. Please try again.");
    }
    setIsProcessing(false);
  };

  // Filter out the current physio from the list
  const otherPhysios = availablePhysios.filter((p) => p.id !== physioId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-teal-300 text-teal-700 hover:bg-teal-50"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Initiate Handoff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Care Handoff</DialogTitle>
          <DialogDescription>
            Transfer this patient's care to another physiotherapist. The patient
            will be asked to consent to a Continuity Summary being shared.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label
            htmlFor="destination-physio"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Destination Physiotherapist
          </label>
          <Select
            value={destinationPhysioId}
            onValueChange={setDestinationPhysioId}
          >
            <SelectTrigger id="destination-physio">
              <SelectValue placeholder="Select a physiotherapist" />
            </SelectTrigger>
            <SelectContent>
              {otherPhysios.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.clinicName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInitiate}
            disabled={!destinationPhysioId || isProcessing}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initiating...
              </>
            ) : (
              "Initiate Handoff"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
